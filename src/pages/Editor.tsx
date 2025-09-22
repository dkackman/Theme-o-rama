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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useErrors } from '@/hooks/useErrors';
import { useWorkingTheme } from '@/hooks/useWorkingTheme';
import { validateThemeJson } from '@/lib/themes';
import {
  hslToRgb,
  isTauriEnvironment,
  isValidFilename,
  rgbToHsl,
} from '@/lib/utils';
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

  const [colorPickerColor, setColorPickerColor] = useState<{
    r: number;
    g: number;
    b: number;
  }>(selectedColor);

  const [backgroundImage, setBackgroundImage] = useLocalStorage<string | null>(
    'background-image',
    null,
  );

  const [themeName, setThemeName] = useLocalStorage<string>(
    'theme-o-rama-design-theme-name',
    '',
  );

  const [backdropFilters, setBackdropFilters] = useLocalStorage<boolean>(
    'theme-o-rama-backdrop-filters',
    true,
  );

  const [isApplying, setIsApplying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationState, setValidationState] = useState<
    'none' | 'valid' | 'invalid'
  >('none');
  const [isTauri, setIsTauri] = useState(false);

  useEffect(() => {
    setIsTauri(isTauriEnvironment());
  }, []);

  // Load working theme data when component mounts
  useEffect(() => {
    if (workingTheme) {
      // Extract data from working theme to populate form fields
      if (workingTheme.colors?.themeColor) {
        const newColor = hslToRgb(workingTheme.colors.themeColor);
        if (newColor) {
          setSelectedColor(newColor);
          setColorPickerColor(newColor);
        }
      }

      if (workingTheme.displayName) {
        setThemeName(workingTheme.displayName);
      }
    }
  }, [workingTheme, setSelectedColor, setThemeName]);

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
      backdropFilters?: boolean,
    ) => {
      const hsl = rgbToHsl(color.r, color.g, color.b);
      const themeName = name || 'design';
      const theme = {
        name: themeName,
        displayName: themeName,
        mostLike: (hsl.l > 50 ? 'light' : 'dark') as 'light' | 'dark',
        inherits: 'color',
        schemaVersion: 1 as const,
        backgroundImage: backgroundImageUrl
          ? '{NEED_DATA_URL_BACKGROUND_IMAGE}'
          : undefined,
        colors: {
          themeColor: `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%)`,
          background: backgroundImageUrl ? 'transparent' : `var(--theme-color)`,
          ...(backdropFilters === false && {
            cardBackdropFilter: null,
            popoverBackdropFilter: null,
            inputBackdropFilter: null,
          }),
        },
        ...(backdropFilters === false && {
          sidebar: {
            backdropFilter: null,
          },
          tables: {
            header: {
              backdropFilter: null,
            },
          },
          row: {
            backdropFilter: null,
          },
          footer: {
            backdropFilter: null,
          },
          buttons: {
            default: {
              backdropFilter: null,
            },
            outline: {
              backdropFilter: null,
            },
            secondary: {
              backdropFilter: null,
            },
            destructive: {
              backdropFilter: null,
            },
            ghost: {
              backdropFilter: null,
            },
            link: {
              backdropFilter: null,
            },
          },
        }),
      };
      return theme;
    },
    [],
  );

  // Memoize the generated theme to prevent unnecessary re-renders
  const generatedTheme = useMemo(() => {
    return generateThemeFromColor(
      selectedColor,
      backgroundImage,
      themeName,
      backdropFilters,
    );
  }, [
    selectedColor,
    backgroundImage,
    themeName,
    generateThemeFromColor,
    backdropFilters,
  ]);

  // Update working theme only when user explicitly changes color, background image, or theme name
  // This prevents circular updates that cause jittery behavior
  // Note: We intentionally don't include generatedTheme in deps to prevent circular updates
  useEffect(() => {
    updateWorkingTheme(generatedTheme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedColor,
    backgroundImage,
    themeName,
    updateWorkingTheme,
    backdropFilters,
  ]);

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
                          color={colorPickerColor}
                          onChange={setColorPickerColor}
                          style={{ width: '200px', height: '200px' }}
                        />
                      </div>
                      <div className='text-center'>
                        <div
                          className='w-16 h-16 mx-auto rounded-lg border-2 border-border shadow-sm'
                          style={{
                            backgroundColor: `rgba(${colorPickerColor.r}, ${colorPickerColor.g}, ${colorPickerColor.b})`,
                          }}
                        />
                        <div className='mt-2 space-y-1'>
                          <p className='text-sm text-muted-foreground'>
                            RGBA({colorPickerColor.r}, {colorPickerColor.g},{' '}
                            {colorPickerColor.b})
                          </p>
                          <p className='text-sm text-muted-foreground'>
                            HSL(
                            {
                              rgbToHsl(
                                colorPickerColor.r,
                                colorPickerColor.g,
                                colorPickerColor.b,
                              ).h
                            }
                            ,{' '}
                            {
                              rgbToHsl(
                                colorPickerColor.r,
                                colorPickerColor.g,
                                colorPickerColor.b,
                              ).s
                            }
                            %,{' '}
                            {
                              rgbToHsl(
                                colorPickerColor.r,
                                colorPickerColor.g,
                                colorPickerColor.b,
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
                    backgroundImageUrl={backgroundImage}
                    onBackgroundImageChange={setBackgroundImage}
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
