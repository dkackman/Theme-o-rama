import { BackgroundImageEditor } from '@/components/BackgroundImageEditor';
import Header from '@/components/Header';
import Layout from '@/components/Layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useErrors } from '@/hooks/useErrors';
import { useWorkingTheme } from '@/hooks/useWorkingTheme';
import { validateThemeJson } from '@/lib/themes';
import { isTauriEnvironment, isValidFilename, rgbToHsl } from '@/lib/utils';
import { open, save } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import {
  Check,
  Eye,
  FolderOpen,
  Info,
  Loader2,
  RotateCcw,
  Save,
  Upload,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RgbColorPicker } from 'react-colorful';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTheme } from 'theme-o-rama';
import { useLocalStorage } from 'usehooks-ts';

export default function Editor() {
  const { setTheme, setCustomTheme } = useTheme();
  const { addError } = useErrors();
  const navigate = useNavigate();
  const {
    workingTheme,
    workingThemeJson,
    updateWorkingTheme,
    updateWorkingThemeFromJson,
    clearWorkingTheme,
  } = useWorkingTheme();

  // Visual editor state
  const [selectedColor, setSelectedColor] = useLocalStorage<{
    r: number;
    g: number;
    b: number;
  }>('theme-o-rama-design-selected-color', {
    r: 27,
    g: 30,
    b: 51,
  });

  const [prompt, setPrompt] = useLocalStorage<string>(
    'theme-o-rama-design-prompt',
    '',
  );

  const [generatedImageUrl, setGeneratedImageUrl] = useLocalStorage<
    string | null
  >('theme-o-rama-design-generated-image-url', null);

  const [themeName, setThemeName] = useLocalStorage<string>(
    'theme-o-rama-design-theme-name',
    '',
  );

  const [selectedImageModel, setSelectedImageModel] = useLocalStorage<string>(
    'theme-o-rama-image-model',
    'dall-e-3',
  );

  const [backdropFilters, setBackdropFilters] = useLocalStorage<boolean>(
    'theme-o-rama-backdrop-filters',
    true,
  );

  // Editor state
  const [isApplying, setIsApplying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationState, setValidationState] = useState<
    'none' | 'valid' | 'invalid'
  >('none');
  const [isTauri, setIsTauri] = useState(false);

  // Initialize Tauri detection
  useEffect(() => {
    setIsTauri(isTauriEnvironment());
  }, []);

  // Load working theme data when component mounts
  useEffect(() => {
    if (workingTheme) {
      // Extract data from working theme to populate form fields
      if (workingTheme.colors?.themeColor) {
        // Parse HSL color to RGB
        const hslMatch = workingTheme.colors.themeColor.match(
          /hsl\((\d+)\s+(\d+)%\s+(\d+)%\)/,
        );
        if (hslMatch) {
          const h = parseInt(hslMatch[1]);
          const s = parseInt(hslMatch[2]);
          const l = parseInt(hslMatch[3]);

          // Convert HSL to RGB
          const c = ((1 - Math.abs((2 * l) / 100 - 1)) * s) / 100;
          const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
          const m = l / 100 - c / 2;

          let r, g, b;
          if (0 <= h && h < 60) {
            r = c;
            g = x;
            b = 0;
          } else if (60 <= h && h < 120) {
            r = x;
            g = c;
            b = 0;
          } else if (120 <= h && h < 180) {
            r = 0;
            g = c;
            b = x;
          } else if (180 <= h && h < 240) {
            r = 0;
            g = x;
            b = c;
          } else if (240 <= h && h < 300) {
            r = x;
            g = 0;
            b = c;
          } else {
            r = c;
            g = 0;
            b = x;
          }

          setSelectedColor({
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255),
          });
        }
      }

      if (workingTheme.displayName) {
        setThemeName(workingTheme.displayName);
      }

      if (workingTheme.backgroundImage) {
        // Save the working theme's background image to localStorage for unified handling
        localStorage.setItem('background-image', workingTheme.backgroundImage);
        setGeneratedImageUrl(workingTheme.backgroundImage);
      }
    }
  }, [workingTheme, setSelectedColor, setThemeName, setGeneratedImageUrl]);

  // Generate theme JSON from selected color and optional background image
  const generateThemeFromColor = useCallback(
    (
      color: {
        r: number;
        g: number;
        b: number;
      },
      backgroundImageUrl?: string | null,
      name?: string,
    ) => {
      const hsl = rgbToHsl(color.r, color.g, color.b);
      const themeName = name || 'design';
      const theme = {
        name: themeName,
        displayName: themeName,
        mostLike: (hsl.l > 50 ? 'light' : 'dark') as 'light' | 'dark',
        inherits: 'color',
        schemaVersion: 1 as const,
        backgroundImage: backgroundImageUrl || undefined,
        colors: {
          themeColor: `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%)`,
          background: backgroundImageUrl ? 'transparent' : `var(--theme-color)`,
          ...(backdropFilters === false && {
            cardBackdropFilter: undefined,
            popoverBackdropFilter: undefined,
            inputBackdropFilter: undefined,
          }),
        },
        ...(backdropFilters === false && {
          sidebar: {
            backdropFilter: undefined,
          },
          tables: {
            header: {
              backdropFilter: undefined,
            },
          },
          row: {
            backdropFilter: undefined,
          },
          footer: {
            backdropFilter: undefined,
          },
          buttons: {
            default: {
              backdropFilter: undefined,
            },
            outline: {
              backdropFilter: undefined,
            },
            secondary: {
              backdropFilter: undefined,
            },
            destructive: {
              backdropFilter: undefined,
            },
            ghost: {
              backdropFilter: undefined,
            },
            link: {
              backdropFilter: undefined,
            },
          },
        }),
      };
      return theme;
    },
    [backdropFilters],
  );

  // Memoize the generated theme to prevent unnecessary re-renders
  const generatedTheme = useMemo(() => {
    return generateThemeFromColor(selectedColor, generatedImageUrl, themeName);
  }, [selectedColor, generatedImageUrl, themeName, generateThemeFromColor]);

  // Update working theme when color, background image, or theme name changes
  // (but don't automatically apply to current theme)
  useEffect(() => {
    updateWorkingTheme(generatedTheme);
  }, [generatedTheme, updateWorkingTheme]);

  // Handlers
  const handleApplyTheme = () => {
    if (!workingThemeJson || !workingThemeJson.trim()) {
      addError({
        kind: 'invalid',
        reason: 'Please enter theme JSON',
      });
      return;
    }

    setIsApplying(true);

    try {
      const success = setCustomTheme(workingThemeJson);
      if (!success) {
        addError({
          kind: 'invalid',
          reason: 'Failed to apply theme. Please check your JSON format.',
        });
      } else {
        addError({
          kind: 'success',
          reason: 'Working theme applied successfully!',
        });
      }
    } catch (err) {
      addError({
        kind: 'invalid',
        reason: 'An error occurred while applying the theme',
      });
      console.error('Error applying theme:', err);
    } finally {
      setIsApplying(false);
    }
  };

  const handleValidateTheme = () => {
    if (!workingThemeJson || !workingThemeJson.trim()) {
      setValidationState('invalid');
      addError({
        kind: 'invalid',
        reason: 'Please enter theme JSON to validate',
      });
      return;
    }

    try {
      validateThemeJson(workingThemeJson);
      setValidationState('valid');
      addError({
        kind: 'success',
        reason: 'Theme JSON is valid',
      });
    } catch (err) {
      setValidationState('invalid');
      addError({
        kind: 'invalid',
        reason: `Invalid JSON format. Please check your syntax. ${err}`,
      });
    }
  };

  const handleClearTheme = () => {
    clearWorkingTheme();
    setTheme('light');
  };

  const handleSave = async () => {
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
      // Use the generated theme with the user-provided name
      const finalTheme = {
        ...generatedTheme,
        name: themeName.trim(),
        displayName: themeName.trim(),
        mostLike: generatedTheme.mostLike as 'light' | 'dark',
      };

      // Update the working theme with the final theme
      updateWorkingTheme(finalTheme);

      // Create the theme JSON string
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
          } else {
            // User cancelled the dialog
            toast.info('Save cancelled');
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
  };

  const handleOpenTheme = async () => {
    if (isTauri) {
      try {
        // Show file open dialog
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
          // Read the file content
          const fileContent = await readTextFile(filePath as string);

          // Validate the JSON
          try {
            validateThemeJson(fileContent);
            setValidationState('valid');

            // Update the working theme with the file content
            updateWorkingThemeFromJson(fileContent);

            addError({
              kind: 'success',
              reason: 'Theme file loaded and validated successfully',
            });
          } catch (validationError) {
            setValidationState('invalid');
            addError({
              kind: 'invalid',
              reason: `Invalid theme file: ${validationError}`,
            });
          }
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
  };

  const handleWebFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target?.result as string;

        try {
          setValidationState('none');
          updateWorkingThemeFromJson(fileContent);
          addError({
            kind: 'success',
            reason: 'Theme file loaded successfully',
          });
        } catch (validationError) {
          setValidationState('invalid');
          addError({
            kind: 'invalid',
            reason: `Invalid theme file: ${validationError}`,
          });
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  const updateThemeJson = (value: string) => {
    updateWorkingThemeFromJson(value);
    setValidationState('none'); // Reset validation state when JSON changes
  };

  try {
    return (
      <Layout>
        <Header title='Theme Editor' />

        <div className='flex-1 overflow-auto'>
          <div className='container mx-auto p-6 space-y-6'>
            {/* Main Editor */}
            <Tabs defaultValue='visual' className='space-y-4'>
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='visual'>Visual Editor</TabsTrigger>
                <TabsTrigger value='json'>JSON Editor</TabsTrigger>
              </TabsList>

              {/* Visual Editor Tab */}
              <TabsContent value='visual' className='space-y-4'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                  {/* Color Picker */}
                  <Card>
                    <CardHeader>
                      <CardTitle className='text-lg'>Color Selection</CardTitle>
                      <CardDescription>
                        Choose your theme&apos;s base color
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='flex justify-center'>
                        <RgbColorPicker
                          color={selectedColor}
                          onChange={setSelectedColor}
                          style={{ width: '200px', height: '200px' }}
                        />
                      </div>
                      <div className='text-center'>
                        <div
                          className='w-16 h-16 mx-auto rounded-lg border-2 border-border shadow-sm'
                          style={{
                            backgroundColor: `rgba(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b})`,
                          }}
                        />
                        <div className='mt-2 space-y-1'>
                          <p className='text-sm text-muted-foreground'>
                            RGBA({selectedColor.r}, {selectedColor.g},{' '}
                            {selectedColor.b})
                          </p>
                          <p className='text-sm text-muted-foreground'>
                            HSL(
                            {
                              rgbToHsl(
                                selectedColor.r,
                                selectedColor.g,
                                selectedColor.b,
                              ).h
                            }
                            ,{' '}
                            {
                              rgbToHsl(
                                selectedColor.r,
                                selectedColor.g,
                                selectedColor.b,
                              ).s
                            }
                            %,{' '}
                            {
                              rgbToHsl(
                                selectedColor.r,
                                selectedColor.g,
                                selectedColor.b,
                              ).l
                            }
                            %)
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Image Generation */}
                  <BackgroundImageEditor
                    prompt={prompt}
                    onPromptChange={setPrompt}
                    generatedImageUrl={generatedImageUrl}
                    onGeneratedImageChange={setGeneratedImageUrl}
                    selectedImageModel={selectedImageModel}
                    onImageModelChange={setSelectedImageModel}
                    selectedColor={selectedColor}
                    backdropFilters={backdropFilters}
                    onBackdropFiltersChange={setBackdropFilters}
                  />
                </div>
              </TabsContent>

              {/* JSON Editor Tab */}
              <TabsContent value='json' className='space-y-4'>
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>JSON Editor</CardTitle>
                    <CardDescription>
                      Edit your theme directly in JSON format
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <Label htmlFor='theme-json'>Theme JSON</Label>
                    <Textarea
                      id='theme-json'
                      value={workingThemeJson || ''}
                      onChange={(e) => updateThemeJson(e.target.value)}
                      className='w-full h-80 p-3 border border-gray-300 rounded font-mono text-sm bg-gray-50 resize-y'
                      style={{
                        fontFamily:
                          'Monaco, Menlo, Ubuntu Mono, Consolas, source-code-pro, monospace',
                        tabSize: 4,
                        MozTabSize: 4,
                        fontSize: 14,
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        whiteSpace: 'pre',
                      }}
                      spellCheck={false}
                      autoComplete='off'
                      autoCorrect='off'
                      autoCapitalize='off'
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Actions Panel */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Actions</CardTitle>
                <CardDescription>
                  Manage your theme with these actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-2 md:grid-cols-5 gap-3'>
                  <Button
                    onClick={handleOpenTheme}
                    variant='outline'
                    className='flex flex-col items-center gap-2 h-auto py-4'
                  >
                    <FolderOpen className='h-5 w-5' />
                    <span className='text-sm'>Open Theme</span>
                  </Button>

                  <Button
                    onClick={handleApplyTheme}
                    disabled={isApplying || !workingThemeJson?.trim()}
                    className='flex flex-col items-center gap-2 h-auto py-4'
                  >
                    {isApplying ? (
                      <>
                        <Loader2 className='h-5 w-5 animate-spin' />
                        <span className='text-sm'>Applying...</span>
                      </>
                    ) : (
                      <>
                        <Upload className='h-5 w-5' />
                        <span className='text-sm'>Apply Theme</span>
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleValidateTheme}
                    variant='outline'
                    disabled={!workingThemeJson?.trim()}
                    className={`flex flex-col items-center gap-2 h-auto py-4 ${
                      validationState === 'valid'
                        ? 'border-green-500 text-green-600 hover:bg-green-50'
                        : validationState === 'invalid'
                          ? 'border-red-500 text-red-600 hover:bg-red-50'
                          : ''
                    }`}
                  >
                    <Check className='h-5 w-5' />
                    <span className='text-sm'>Validate</span>
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
                      isSaving ||
                      !themeName.trim() ||
                      !isValidFilename(themeName)
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
                  </Button>
                </div>

                {/* Theme Name Input */}
                <div className='mt-4 space-y-2'>
                  <Label htmlFor='themeName'>Theme Name</Label>
                  <div className='flex gap-2'>
                    <input
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
                <input
                  type='file'
                  accept='.json,application/json'
                  onChange={handleWebFileUpload}
                  className='hidden'
                  id='theme-file-input'
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  } catch (error) {
    console.error('Error rendering theme editor:', error);
    return (
      <Layout>
        <Header title='Theme Editor' />
        <div className='flex-1 overflow-auto'>
          <div className='container mx-auto p-6'>
            <Alert variant='destructive'>
              <Info className='h-4 w-4' />
              <AlertDescription>
                Error rendering theme editor:{' '}
                {error instanceof Error ? error.message : 'Unknown error'}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </Layout>
    );
  }
}
