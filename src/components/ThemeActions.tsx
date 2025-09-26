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
import {
  DESIGN_THEME_NAME,
  useWorkingThemeState,
} from '@/hooks/useWorkingThemeState';
import { isTauriEnvironment } from '@/lib/utils';
import { open, save } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { FileInput, FolderOpen, Loader2, RotateCcw, Save } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useTheme } from 'theme-o-rama';

export function ThemeActions() {
  const { addError } = useErrors();
  const { currentTheme, setCustomTheme } = useTheme();
  const {
    WorkingTheme,
    setThemeDisplayName,
    setInherits,
    setMostLike,
    clearWorkingTheme,
    deriveThemeName,
    setWorkingThemeFromCurrent,
    setWorkingThemeFromJson,
    getInitializedWorkingTheme,
  } = useWorkingThemeState();
  const [isTauri, setIsTauri] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check if working theme is currently selected
  const isWorkingThemeSelected = currentTheme?.name === DESIGN_THEME_NAME;

  useEffect(() => {
    setIsTauri(isTauriEnvironment());
  }, []);

  // Handlers

  const handleClearTheme = useCallback(() => {
    clearWorkingTheme();
    // Apply the reset working theme immediately and ensure it's selected
    const initializedTheme = getInitializedWorkingTheme();
    // Ensure the theme name is correct for selection detection
    const workingThemeWithCorrectName = {
      ...initializedTheme,
      name: DESIGN_THEME_NAME,
    };
    const workingThemeJson = JSON.stringify(
      workingThemeWithCorrectName,
      null,
      2,
    );
    setCustomTheme(workingThemeJson);
  }, [clearWorkingTheme, getInitializedWorkingTheme, setCustomTheme]);

  const handleStartWithThisTheme = useCallback(() => {
    if (currentTheme) {
      setWorkingThemeFromCurrent(currentTheme);
      // Apply the working theme immediately and ensure it's selected
      const initializedTheme = getInitializedWorkingTheme();
      // Ensure the theme name is correct for selection detection
      const workingThemeWithCorrectName = {
        ...initializedTheme,
        name: DESIGN_THEME_NAME,
      };
      const workingThemeJson = JSON.stringify(
        workingThemeWithCorrectName,
        null,
        2,
      );
      setCustomTheme(workingThemeJson);
    }
  }, [
    currentTheme,
    setWorkingThemeFromCurrent,
    getInitializedWorkingTheme,
    setCustomTheme,
  ]);

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
          setWorkingThemeFromJson(fileContent);

          // Apply the imported theme immediately
          const initializedTheme = getInitializedWorkingTheme();
          const workingThemeWithCorrectName = {
            ...initializedTheme,
            name: DESIGN_THEME_NAME,
          };
          const workingThemeJson = JSON.stringify(
            workingThemeWithCorrectName,
            null,
            2,
          );
          setCustomTheme(workingThemeJson);
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
  }, [
    isTauri,
    addError,
    setWorkingThemeFromJson,
    getInitializedWorkingTheme,
    setCustomTheme,
  ]);
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
          onClick={
            isWorkingThemeSelected ? handleClearTheme : handleStartWithThisTheme
          }
          variant='outline'
          className={`flex flex-col items-center gap-2 h-auto py-4 ${
            isWorkingThemeSelected
              ? 'text-destructive hover:text-destructive'
              : 'text-primary hover:text-primary'
          }`}
        >
          <RotateCcw className='h-5 w-5' />
          <span className='text-sm'>
            {isWorkingThemeSelected ? 'Reset' : 'Start with this theme'}
          </span>
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
                try {
                  setWorkingThemeFromJson(fileContent);

                  // Apply the imported theme immediately
                  const initializedTheme = getInitializedWorkingTheme();
                  const workingThemeWithCorrectName = {
                    ...initializedTheme,
                    name: DESIGN_THEME_NAME,
                  };
                  const workingThemeJson = JSON.stringify(
                    workingThemeWithCorrectName,
                    null,
                    2,
                  );
                  setCustomTheme(workingThemeJson);
                } catch (error) {
                  console.error('Error loading theme file:', error);
                  addError({
                    kind: 'invalid',
                    reason: 'Failed to load theme file',
                  });
                }
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
