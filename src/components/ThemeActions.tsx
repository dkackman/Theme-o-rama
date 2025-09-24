import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useErrors } from '@/hooks/useErrors';
import { useWorkingThemeState } from '@/hooks/useWorkingThemeState';
import { isTauriEnvironment } from '@/lib/utils';
import { open, save } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { FileInput, FolderOpen, Loader2, RotateCcw, Save } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Theme, useTheme } from 'theme-o-rama';

interface ThemeActionsProps {
  // State
  generatedTheme: Theme; // Theme object for saving
  currentTheme: Theme | null; // Current theme to check if working theme is selected

  // Setters
  updateWorkingThemeFromJson: (json: string) => void;
}

export function ThemeActions({
  currentTheme,
  updateWorkingThemeFromJson,
}: ThemeActionsProps) {
  const { addError } = useErrors();
  const { setTheme } = useTheme();
  const {
    WorkingTheme,
    setThemeDisplayName,
    setInherits,
    setMostLike,
    clearWorkingTheme,
    deriveThemeName,
  } = useWorkingThemeState();
  const [isTauri, setIsTauri] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check if working theme is currently selected
  const isWorkingThemeSelected =
    currentTheme?.name === 'theme-a-roo-working-theme';

  useEffect(() => {
    setIsTauri(isTauriEnvironment());
  }, []);

  // Handlers

  const handleClearTheme = useCallback(() => {
    clearWorkingTheme();
    setTheme('light');
  }, [clearWorkingTheme, setTheme]);

  const handleSave = useCallback(async () => {
    if (!WorkingTheme.displayName?.trim()) {
      toast.error('Please enter a theme name');
      return;
    }

    setIsSaving(true);
    try {
      const finalTheme = {
        ...WorkingTheme,
        name: deriveThemeName(),
      };
      const themeJson = JSON.stringify(finalTheme, null, 2);

      if (isTauriEnvironment() && save && writeTextFile) {
        try {
          // Use Tauri's native save dialog
          const filePath = await save({
            defaultPath: `${deriveThemeName()}.json`,
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
        link.download = `${deriveThemeName()}.json`;
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
  }, [WorkingTheme, deriveThemeName]);

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
          disabled={!isWorkingThemeSelected}
          variant='outline'
          className='flex flex-col items-center gap-2 h-auto py-4 text-destructive hover:text-destructive disabled:opacity-50 disabled:cursor-not-allowed'
        >
          <RotateCcw className='h-5 w-5' />
          <span className='text-sm'>Reset</span>
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving || !WorkingTheme.displayName?.trim()}
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
              <span className='text-sm'>Save Theme as...</span>
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

      {/* Theme Name and Selectors */}
      <div className='flex flex-col xl:flex-row gap-2'>
        <div className='flex-1 space-y-2'>
          <Label htmlFor='themeName'>Working Theme Name</Label>
          <Input
            id='themeName'
            placeholder='Enter a name for your theme'
            value={WorkingTheme.displayName || ''}
            onChange={(e) => setThemeDisplayName(e.target.value)}
            disabled={!isWorkingThemeSelected}
            className='w-full px-3 py-2 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed'
          />
        </div>

        <div className='flex flex-col lg:flex-row xl:contents gap-2'>
          <div className='flex-1 space-y-2'>
            <Label htmlFor='inherits'>Inherits</Label>
            <Select
              value={WorkingTheme.inherits || 'none'}
              onValueChange={(value) =>
                setInherits(
                  value === 'none'
                    ? undefined
                    : (value as 'light' | 'dark' | 'color'),
                )
              }
              disabled={!isWorkingThemeSelected}
            >
              <SelectTrigger className='w-full disabled:opacity-50 disabled:cursor-not-allowed'>
                <SelectValue placeholder='Select inheritance' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='none'>None</SelectItem>
                <SelectItem value='light'>Light</SelectItem>
                <SelectItem value='dark'>Dark</SelectItem>
                <SelectItem value='color'>Color</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='flex-1 space-y-2'>
            <Label htmlFor='mostLike'>Most Like</Label>
            <Select
              value={WorkingTheme.mostLike || 'none'}
              onValueChange={(value) =>
                setMostLike(
                  value === 'none' ? undefined : (value as 'light' | 'dark'),
                )
              }
              disabled={!isWorkingThemeSelected}
            >
              <SelectTrigger className='w-full disabled:opacity-50 disabled:cursor-not-allowed'>
                <SelectValue placeholder='Select most like' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='none'>None</SelectItem>
                <SelectItem value='light'>Light</SelectItem>
                <SelectItem value='dark'>Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
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
