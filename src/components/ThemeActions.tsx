import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useErrors } from '@/hooks/useErrors';
import { isTauriEnvironment, isValidFilename } from '@/lib/utils';
import { open, save } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import {
  Eye,
  FileInput,
  FolderOpen,
  Loader2,
  RotateCcw,
  Save,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Theme, useTheme } from 'theme-o-rama';

interface ThemeActionsProps {
  // State
  themeName: string;
  generatedTheme: Theme; // Theme object for saving

  // Setters
  setThemeName: (name: string) => void;
  updateWorkingTheme: (theme: Theme) => void;
  updateWorkingThemeFromJson: (json: string) => void;
  clearWorkingTheme: () => void;
}

export function ThemeActions({
  themeName,
  generatedTheme,
  setThemeName,
  updateWorkingTheme,
  updateWorkingThemeFromJson,
  clearWorkingTheme,
}: ThemeActionsProps) {
  const navigate = useNavigate();
  const { addError } = useErrors();
  const { setTheme } = useTheme();
  const [isTauri, setIsTauri] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsTauri(isTauriEnvironment());
  }, []);

  // Handlers

  const handleClearTheme = useCallback(() => {
    clearWorkingTheme();
    setTheme('light');
  }, [clearWorkingTheme, setTheme]);

  const handleSave = useCallback(async () => {
    if (!themeName.trim()) {
      toast.error('Please enter a theme name');
      return;
    }

    if (!isValidFilename(themeName)) {
      toast.error('Theme name contains invalid characters for filename');
      return;
    }

    setIsSaving(true);
    try {
      const finalTheme = {
        ...generatedTheme,
        name: themeName.trim(),
        displayName: themeName.trim(),
        mostLike: generatedTheme.mostLike as 'light' | 'dark',
      };

      updateWorkingTheme(finalTheme);
      const themeJson = JSON.stringify(finalTheme, null, 2);

      if (isTauriEnvironment() && save && writeTextFile) {
        try {
          // Use Tauri's native save dialog
          const filePath = await save({
            defaultPath: `${themeName.trim()}.json`,
            filters: [
              {
                name: 'Theme Files',
                extensions: ['json'],
              },
              {
                name: 'All Files',
                extensions: ['*'],
              },
            ],
          });

          if (filePath) {
            await writeTextFile(filePath, themeJson);
            toast.success('Theme saved successfully!');
          }
        } catch (error) {
          console.error('Tauri save error:', error);
          toast.error('Error saving with Tauri dialog');
        }
      } else {
        // Fallback for web mode - use browser download
        const blob = new Blob([themeJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${themeName.trim()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Theme saved successfully!');
      }
    } catch (error) {
      console.error('Error saving theme:', error);
      toast.error('Error saving theme');
    } finally {
      setIsSaving(false);
    }
  }, [themeName, generatedTheme, updateWorkingTheme]);

  const handleOpenTheme = useCallback(async () => {
    if (isTauri) {
      try {
        const filePath = await open({
          filters: [
            {
              name: 'Theme Files',
              extensions: ['json'],
            },
            {
              name: 'All Files',
              extensions: ['*'],
            },
          ],
        });

        if (filePath) {
          const fileContent = await readTextFile(filePath as string);

          updateWorkingThemeFromJson(fileContent);
        }
      } catch (error) {
        console.error('Error opening theme file:', error);
        addError({
          kind: 'invalid',
          reason: 'Failed to open theme file',
        });
      }
    } else {
      // Web environment - trigger file input
      const fileInput = document.getElementById(
        'theme-file-input',
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.click();
      }
    }
  }, [isTauri, updateWorkingThemeFromJson, addError]);
  return (
    <div className='space-y-4'>
      {/* Action Buttons */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        <Button
          onClick={handleOpenTheme}
          variant='outline'
          className='flex flex-col items-center gap-2 h-auto py-4'
        >
          <FolderOpen className='h-5 w-5' />
          <span className='text-sm'>Open Theme</span>
        </Button>
        <Button
          onClick={handleClearTheme}
          variant='outline'
          className='flex flex-col items-center gap-2 h-auto py-4 text-destructive hover:text-destructive'
        >
          <RotateCcw className='h-5 w-5' />
          <span className='text-sm'>Reset</span>
        </Button>
        <Button
          onClick={handleSave}
          disabled={
            isSaving || !themeName.trim() || !isValidFilename(themeName)
          }
          className='flex flex-col items-center gap-2 h-auto py-4'
        >
          {isSaving ? (
            <>
              <Loader2 className='h-5 w-5 animate-spin' />
              <span className='text-sm'>Saving...</span>
            </>
          ) : (
            <>
              <Save className='h-5 w-5' />
              <span className='text-sm'>Save Theme</span>
            </>
          )}
        </Button>{' '}
        <Button
          disabled={true}
          className='flex flex-col items-center gap-2 h-auto py-4'
        >
          <>
            <FileInput className='h-5 w-5' />
            <span className='text-sm'>Prepare NFT</span>
          </>
        </Button>
      </div>

      {/* Theme Name Input */}
      <div className='space-y-2'>
        <Label htmlFor='themeName'>Theme Name</Label>
        <div className='flex gap-2'>
          <Input
            id='themeName'
            placeholder='Enter a name for your theme'
            value={themeName}
            onChange={(e) => setThemeName(e.target.value)}
            className='flex-1 px-3 py-2 border border-gray-300 rounded text-sm'
          />
          <Button
            onClick={() => navigate('/theme-preview')}
            variant='outline'
            size='sm'
          >
            <Eye className='h-4 w-4 mr-2' />
            Preview
          </Button>
        </div>
        {themeName && !isValidFilename(themeName) && (
          <p className='text-sm text-destructive'>
            Theme name contains invalid characters for filename
          </p>
        )}
      </div>

      {/* Hidden file input for web environment */}
      {!isTauri && (
        <input
          id='theme-file-input'
          type='file'
          accept='.json'
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                const fileContent = event.target?.result as string;
                updateWorkingThemeFromJson(fileContent);
              };
              reader.readAsText(file);
            }
            e.target.value = '';
          }}
        />
      )}
    </div>
  );
}
