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
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useWorkingTheme } from '@/hooks/useWorkingTheme';
import { generateImage } from '@/lib/opeanai';
import { isTauriEnvironment, isValidFilename, rgbToHsl } from '@/lib/utils';
import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import { Info, MessageSquare, Palette, Save, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RgbColorPicker } from 'react-colorful';
import { toast } from 'react-toastify';
import { useTheme } from 'theme-o-rama';
import { useLocalStorage } from 'usehooks-ts';

export default function Design() {
  const { setCustomTheme } = useTheme();
  const { workingTheme, updateWorkingTheme } = useWorkingTheme();

  // Persist design state using localStorage
  const [selectedColor, setSelectedColor] = useLocalStorage<{
    r: number;
    g: number;
    b: number;
  }>('theme-o-rama-design-selected-color', {
    r: 27,
    g: 30,
    b: 51,
  });

  const [currentStep, setCurrentStep] = useLocalStorage<number>(
    'theme-o-rama-design-current-step',
    1,
  );

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

  // Non-persistent state
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedImageModel, setSelectedImageModel] = useLocalStorage<string>(
    'theme-o-rama-image-model',
    'dall-e-3',
  );
  const [backdropFilters, setBackdropFilters] = useLocalStorage<boolean>(
    'theme-o-rama-backdrop-filters',
    true,
  );

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
        schemaVersion: 1,
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

  // Memoize the current theme to prevent unnecessary re-renders
  const currentTheme = useMemo(() => {
    return generateThemeFromColor(selectedColor, generatedImageUrl, themeName);
  }, [selectedColor, generatedImageUrl, themeName, generateThemeFromColor]);

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
        setGeneratedImageUrl(workingTheme.backgroundImage);
      }
    }
  }, [workingTheme, setSelectedColor, setThemeName, setGeneratedImageUrl]);

  // Apply theme when color, background image, or theme name changes
  useEffect(() => {
    const themeJson = JSON.stringify(currentTheme, null, 2);
    setCustomTheme(themeJson);
    // Also update the working theme
    updateWorkingTheme(currentTheme);
  }, [currentTheme, setCustomTheme, updateWorkingTheme]);

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGeneratingImage(true);
    try {
      const colorString = `RGB(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b})`;
      const imageUrl = await generateImage(
        prompt,
        colorString,
        selectedImageModel,
      );

      if (imageUrl) {
        setGeneratedImageUrl(imageUrl);
      } else {
        toast.error('Failed to generate image');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Error generating image');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleClearBackgroundImage = () => {
    setGeneratedImageUrl(null);
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
      // Use the current theme with the user-provided name
      const finalTheme = {
        ...currentTheme,
        name: themeName.trim(),
        displayName: themeName.trim(),
        mostLike: currentTheme.mostLike as 'light' | 'dark',
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <h3 className='text-lg font-semibold mb-2'>
                Choose Your Base Color
              </h3>
              <p className='text-muted-foreground mb-6'>
                Select a color that will serve as the foundation for your theme.
                The theme will update in real-time as you change the color.
              </p>
            </div>

            <div className='flex justify-center'>
              <div className='space-y-4'>
                <RgbColorPicker
                  color={selectedColor}
                  onChange={setSelectedColor}
                  style={{ width: '200px', height: '200px' }}
                />
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
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <h3 className='text-lg font-semibold mb-2'>Add Your Prompt</h3>
              <p className='text-muted-foreground mb-6'>
                Describe the style and mood you want for your theme. An image
                will be generated using your selected color and prompt.
              </p>
            </div>

            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='prompt'>Theme Description</Label>
                <Textarea
                  id='prompt'
                  placeholder='e.g., "A modern minimalist design with clean lines and subtle shadows"'
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className='min-h-[100px]'
                />
              </div>

              <div className='flex items-center gap-3'>
                <div className='flex-1'>
                  <Select
                    value={selectedImageModel}
                    onValueChange={setSelectedImageModel}
                  >
                    <SelectTrigger id='imageModel'>
                      <SelectValue placeholder='Select model' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='dall-e-3'>DALL-E 3</SelectItem>
                      <SelectItem value='gpt-image-1'>GPT Image 1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='backdropFilters'
                    checked={backdropFilters}
                    onCheckedChange={(checked) =>
                      setBackdropFilters(checked === true)
                    }
                  />
                  <Label
                    htmlFor='backdropFilters'
                    className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                  >
                    Backdrop filters
                  </Label>
                </div>
                <div className='flex-1'>
                  <Button
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage || !prompt.trim()}
                    className='w-full'
                  >
                    {isGeneratingImage ? (
                      <>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2' />
                        Generating Image...
                      </>
                    ) : (
                      <>
                        <MessageSquare className='h-4 w-4 mr-2' />
                        Generate Image
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Image Preview */}
              {generatedImageUrl && (
                <div className='flex justify-center'>
                  <div className='relative'>
                    <img
                      src={generatedImageUrl}
                      alt='Generated theme image'
                      className='max-w-full h-auto max-h-64 rounded-lg border border-border shadow-sm justify-center'
                    />
                    <Button
                      variant='destructive'
                      size='sm'
                      onClick={handleClearBackgroundImage}
                      className='absolute -top-2 -right-2 h-6 w-6 rounded-full p-0'
                    >
                      <X className='h-3 w-3' />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <h3 className='text-lg font-semibold mb-2'>Save Your Theme</h3>
              <p className='text-muted-foreground mb-6'>
                Give your theme a name and save it to your collection
              </p>
            </div>

            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='themeName'>Theme Name</Label>
                <Input
                  id='themeName'
                  placeholder='Enter a name for your theme'
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                  className='w-full'
                />
                {themeName && !isValidFilename(themeName) && (
                  <p className='text-sm text-destructive'>
                    Theme name contains invalid characters for filename
                  </p>
                )}
              </div>

              {/* Theme Preview */}
              <div className='space-y-2'>
                <Label>Theme Preview</Label>
                <div className='p-4 border rounded-lg bg-background'>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <div
                        className='w-6 h-6 rounded border'
                        style={{
                          backgroundColor: `rgba(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b})`,
                        }}
                      />
                      <span className='text-sm font-medium'>
                        {themeName || 'Untitled Theme'}
                      </span>
                    </div>
                    {generatedImageUrl && (
                      <div className='text-xs text-muted-foreground'>
                        Includes background image
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  try {
    return (
      <Layout>
        <Header title='Design' />

        <div className='flex-1 overflow-auto'>
          <div className='container mx-auto p-6 space-y-8'>
            {/* Design Process Steps */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Palette className='h-5 w-5' />
                  Design Your Theme
                </CardTitle>
                <CardDescription>
                  Create a custom theme in three simple steps
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Step Indicator */}
                <div className='flex items-center justify-center space-x-4'>
                  {[1, 2, 3].map((step) => (
                    <div key={step} className='flex items-center'>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          step === currentStep
                            ? 'bg-primary text-primary-foreground'
                            : step < currentStep
                              ? 'bg-primary/20 text-primary'
                              : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {step}
                      </div>
                      {step < 3 && (
                        <div
                          className={`w-12 h-0.5 mx-2 ${
                            step < currentStep ? 'bg-primary' : 'bg-muted'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Step Content */}
                {renderStepContent()}

                {/* Navigation Buttons */}
                <div className='flex justify-between pt-1'>
                  <Button
                    variant='outline'
                    onClick={handlePrevStep}
                    disabled={currentStep === 1}
                  >
                    Previous
                  </Button>

                  {currentStep < 3 ? (
                    <Button onClick={handleNextStep}>Next</Button>
                  ) : (
                    <Button
                      onClick={handleSave}
                      disabled={
                        isSaving ||
                        !themeName.trim() ||
                        !isValidFilename(themeName)
                      }
                    >
                      {isSaving ? (
                        <>
                          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2' />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className='h-4 w-4 mr-2' />
                          Save Theme
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  } catch (error) {
    console.error('Error rendering theme page:', error);
    return (
      <Layout>
        <Header title='Themes' />
        <div className='flex-1 overflow-auto'>
          <div className='container mx-auto p-6'>
            <Alert variant='destructive'>
              <Info className='h-4 w-4' />
              <AlertDescription>
                Error rendering theme page:{' '}
                {error instanceof Error ? error.message : 'Unknown error'}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </Layout>
    );
  }
}
