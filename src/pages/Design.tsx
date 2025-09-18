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
import { Textarea } from '@/components/ui/textarea';
import { generateImage } from '@/lib/opeanai';
import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import { Info, MessageSquare, Palette, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { RgbColorPicker } from 'react-colorful';
import { toast } from 'react-toastify';
import { useTheme } from 'theme-o-rama';

// Utility function to validate filename
const isValidFilename = (filename: string): boolean => {
  // Check for invalid characters and ensure it's not empty
  const invalidChars = /[<>:"/\\|?*]/;
  // Check for control characters (ASCII 0-31)
  const hasControlChars = (str: string) => {
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      if (charCode >= 0 && charCode <= 31) {
        return true;
      }
    }
    return false;
  };
  return (
    filename.trim().length > 0 &&
    !invalidChars.test(filename) &&
    !hasControlChars(filename)
  );
};

// Utility function to convert RGB to HSL
const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

export default function Design() {
  const { setCustomTheme } = useTheme();
  const [selectedColor, setSelectedColor] = useState({
    r: 27,
    g: 30,
    b: 51,
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [prompt, setPrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null,
  );
  const [themeName, setThemeName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Generate theme JSON from selected color and optional background image
  const generateThemeFromColor = (
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
      mostLike: hsl.l > 50 ? 'light' : 'dark',
      inherits: 'color',
      schemaVersion: 1,
      backgroundImage: backgroundImageUrl,
      colors: {
        background: `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%)`,
      },
    };

    return theme;
  };

  // Apply theme when color, background image, or theme name changes
  useEffect(() => {
    const themeJson = JSON.stringify(
      generateThemeFromColor(selectedColor, generatedImageUrl, themeName),
      null,
      2,
    );
    setCustomTheme(themeJson);
  }, [selectedColor, generatedImageUrl, themeName, setCustomTheme]);

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
      const imageUrl = await generateImage(prompt, colorString);

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
      // Generate the final theme with the user-provided name
      const finalTheme = generateThemeFromColor(
        selectedColor,
        generatedImageUrl, // This already contains the base64 data
        themeName.trim(),
      );

      // Create the theme JSON string
      const themeJson = JSON.stringify(finalTheme, null, 2);

      // Check if we're in Tauri mode - try multiple detection methods
      const isTauri =
        !!(window as unknown as { __TAURI__: boolean }).__TAURI__ ||
        !!(window as unknown as { __TAURI_INTERNALS__: boolean })
          .__TAURI_INTERNALS__ ||
        typeof (window as unknown as { __TAURI_PLUGIN_INTERNALS__: boolean })
          .__TAURI_PLUGIN_INTERNALS__ !== 'undefined' ||
        typeof (window as unknown as { __TAURI_METADATA__: boolean })
          .__TAURI_METADATA__ !== 'undefined';

      if (isTauri && save && writeTextFile) {
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

              <div className='text-center'>
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

              {/* Image Preview */}
              {generatedImageUrl && (
                <div className='space-y-2'>
                  <Label>Generated Image Preview</Label>
                  <div className='flex justify-center'>
                    <img
                      src={generatedImageUrl}
                      alt='Generated theme image'
                      className='max-w-full h-auto max-h-64 rounded-lg border border-border shadow-sm'
                    />
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
                <div className='flex justify-between pt-6'>
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
