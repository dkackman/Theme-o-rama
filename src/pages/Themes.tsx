import Header from '@/components/Header';
import Layout from '@/components/Layout';
import { ThemeSelector } from '@/components/ThemeSelector';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useErrors } from '@/hooks/useErrors';
import { validateThemeJson } from '@/lib/themes';
import CodeEditor from '@uiw/react-textarea-code-editor';
import {
  Check,
  Copy,
  Eye,
  Image,
  Loader2,
  Maximize2,
  Minimize2,
  Palette,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'theme-o-rama';

export default function Themes() {
  const { currentTheme, isLoading, setTheme, setCustomTheme, reloadThemes } =
    useTheme();
  const { addError } = useErrors();
  const navigate = useNavigate();
  const [themeJson, setThemeJson] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [validationState, setValidationState] = useState<
    'none' | 'valid' | 'invalid'
  >('none');

  // Load theme JSON and background image from localStorage on component mount
  useEffect(() => {
    const savedThemeJson = localStorage.getItem('custom-theme-json');
    if (savedThemeJson) {
      setThemeJson(savedThemeJson);
    }

    const savedBackgroundImage = localStorage.getItem('background-image');
    if (savedBackgroundImage) {
      setBackgroundImage(savedBackgroundImage);
    }
  }, []);

  // Save theme JSON to localStorage whenever it changes
  const updateThemeJson = (value: string) => {
    setThemeJson(value);
    setValidationState('none'); // Reset validation state when JSON changes
  };

  const handleApplyTheme = () => {
    if (!themeJson.trim()) {
      addError({
        kind: 'invalid',
        reason: 'Please enter theme JSON',
      });
      return;
    }

    setIsApplying(true);
    if (themeJson.trim()) {
      localStorage.setItem('custom-theme-json', themeJson);
    } else {
      localStorage.removeItem('custom-theme-json');
    }

    try {
      const success = setCustomTheme(themeJson);
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

  const handleClearTheme = () => {
    setThemeJson('');
    localStorage.removeItem('custom-theme-json');
    setTheme('light');
  };

  const handleCopyCurrentTheme = () => {
    if (currentTheme) {
      // Create a clean copy without internal/processed properties
      const cleanTheme = {
        name: currentTheme.name,
        displayName: currentTheme.displayName,
        schemaVersion: currentTheme.schemaVersion,
        ...(currentTheme.inherits && { inherits: currentTheme.inherits }),
        ...(currentTheme.mostLike && { mostLike: currentTheme.mostLike }),
        ...(currentTheme.backgroundImage && {
          backgroundImage: currentTheme.backgroundImage,
        }),
        ...(currentTheme.colors && { colors: currentTheme.colors }),
        ...(currentTheme.fonts && { fonts: currentTheme.fonts }),
        ...(currentTheme.corners && { corners: currentTheme.corners }),
        ...(currentTheme.shadows && { shadows: currentTheme.shadows }),
        ...(currentTheme.buttons && { buttons: currentTheme.buttons }),
        ...(currentTheme.switches && { switches: currentTheme.switches }),
        ...(currentTheme.tables && { tables: currentTheme.tables }),
        ...(currentTheme.sidebar && { sidebar: currentTheme.sidebar }),
        ...(currentTheme.buttonStyles && {
          buttonStyles: currentTheme.buttonStyles,
        }),
      };

      const themeJsonString = JSON.stringify(cleanTheme, null, 2);
      updateThemeJson(themeJsonString);
    }
  };

  const handleValidateTheme = () => {
    if (!themeJson.trim()) {
      setValidationState('invalid');
      addError({
        kind: 'invalid',
        reason: 'Please enter theme JSON to validate',
      });
      return;
    }

    try {
      validateThemeJson(themeJson);
      setValidationState('valid');
    } catch (err) {
      setValidationState('invalid');
      addError({
        kind: 'invalid',
        reason: `Invalid JSON format. Please check your syntax. ${err}`,
      });
    }
  };

  const handleBackgroundImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setBackgroundImage(result);
        localStorage.setItem('background-image', result);
      };
      reader.readAsDataURL(file);
    }
    // Clear the input value so the same file can be selected again
    event.target.value = '';
  };

  const handleDeleteBackgroundImage = () => {
    setBackgroundImage(null);
    localStorage.removeItem('background-image');
    // Clear the file input value
    const fileInput = document.getElementById(
      'background-image-upload',
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <Header title='Theme' />
        <div className='flex-1 overflow-auto'>
          <div className='container mx-auto p-6'>
            <div className='flex items-center justify-center p-8'>
              <Loader2 className='h-6 w-6 animate-spin' />
              <span className='ml-2'>Loading themes...</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!currentTheme) {
    return (
      <Layout>
        <Header title='Theme' />
        <div className='flex-1 overflow-auto'>
          <div className='container mx-auto p-6'>
            <div className='flex items-center justify-center p-8'>
              <span>No theme available</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  try {
    return (
      <Layout>
        <Header title='Themes' />

        <div className='flex-1 overflow-auto'>
          <div
            className={`container mx-auto p-6 ${isMaximized ? 'h-full flex flex-col' : 'space-y-8'}`}
          >
            {/* Theme Selector - Hidden when custom theme card is maximized */}
            {!isMaximized && (
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle className='flex items-center gap-2'>
                        <Palette className='h-5 w-5' />
                        Choose Your Theme
                      </CardTitle>
                      <CardDescription>
                        Select from our collection of beautiful themes
                      </CardDescription>
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={reloadThemes}
                      disabled={isLoading}
                    >
                      <Loader2
                        className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                      />
                      Reload Themes
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ThemeSelector />
                </CardContent>
              </Card>
            )}

            {/* Custom Theme Input */}
            <Card className={isMaximized ? 'flex-1 flex flex-col min-h-0' : ''}>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='flex items-center gap-2'>
                      <Upload className='h-5 w-5' />
                      Apply Custom Theme
                    </CardTitle>
                    <CardDescription>
                      Paste your theme JSON below to apply a custom theme to the
                      entire application.
                    </CardDescription>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setIsMaximized(!isMaximized)}
                    className='shrink-0'
                  >
                    {isMaximized ? (
                      <Minimize2 className='h-4 w-4' />
                    ) : (
                      <Maximize2 className='h-4 w-4' />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent
                className={`space-y-4 ${isMaximized ? 'flex-1 flex flex-col min-h-0' : ''}`}
              >
                <Label htmlFor='theme-json'>Theme JSON</Label>
                <CodeEditor
                  id='theme-json'
                  data-color-mode={currentTheme?.mostLike || 'light'}
                  language='json'
                  placeholder='Paste your theme JSON here...'
                  value={themeJson}
                  onChange={(e) => updateThemeJson(e.target.value)}
                  padding={15}
                  className={`${isMaximized ? 'flex-1 min-h-0' : 'min-h-[200px]'}`}
                  style={{
                    border: '1px solid #e0e0e0',
                    fontFamily:
                      'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                    minHeight: isMaximized ? '400px' : '200px',
                    maxHeight: isMaximized ? '100%' : '400px',
                    overflow: 'auto',
                    fontSize: 14,
                  }}
                />

                <div className='flex flex-col sm:flex-row gap-2'>
                  <div className='flex flex-col sm:flex-row gap-2'>
                    <Button
                      onClick={handleApplyTheme}
                      disabled={isApplying || !themeJson.trim()}
                      className='w-full sm:w-auto'
                    >
                      {isApplying ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Applying...
                        </>
                      ) : (
                        <>
                          <Upload className='mr-2 h-4 w-4' />
                          Apply Theme
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleClearTheme}
                      variant='outline'
                      className='w-full sm:w-auto'
                    >
                      <X className='mr-2 h-4 w-4' />
                      Clear & Reset
                    </Button>
                    <Button
                      onClick={handleValidateTheme}
                      variant='outline'
                      disabled={!themeJson.trim()}
                      className={`w-full sm:w-auto ${
                        validationState === 'valid'
                          ? 'border-green-500 text-green-600 hover:bg-green-50'
                          : validationState === 'invalid'
                            ? 'border-red-500 text-red-600 hover:bg-red-50'
                            : ''
                      }`}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          validationState === 'valid'
                            ? 'text-green-600'
                            : validationState === 'invalid'
                              ? 'text-red-600'
                              : ''
                        }`}
                      />
                      Validate
                    </Button>
                  </div>
                  <Button
                    onClick={handleCopyCurrentTheme}
                    variant='outline'
                    disabled={!currentTheme}
                    className='w-full sm:w-auto sm:ml-auto'
                  >
                    <Copy className='mr-2 h-4 w-4' />
                    Reset with Current Theme&apos;s JSON
                  </Button>
                </div>

                {/* Background Image Upload Section */}
                <div className='border-t pt-4'>
                  <Label className='text-sm font-medium'>
                    Background Image
                  </Label>
                  <div className='flex items-center justify-between gap-3 mt-2'>
                    <div className='flex items-center gap-3'>
                      <div className='flex items-center gap-2'>
                        <input
                          type='file'
                          accept='image/*'
                          onChange={handleBackgroundImageUpload}
                          className='hidden'
                          id='background-image-upload'
                        />
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            document
                              .getElementById('background-image-upload')
                              ?.click()
                          }
                        >
                          <Image className='mr-2 h-4 w-4' />
                          Upload Image
                        </Button>
                      </div>

                      {/* Image Preview */}
                      {backgroundImage && (
                        <div className='flex items-center gap-2'>
                          <div className='w-8 h-8 rounded border overflow-hidden bg-gray-100'>
                            <img
                              src={backgroundImage}
                              alt='Background preview'
                              className='w-full h-full object-cover'
                            />
                          </div>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={handleDeleteBackgroundImage}
                            className='text-red-600 hover:text-red-700 hover:bg-red-50'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      )}

                      {!backgroundImage && (
                        <span className='text-sm text-gray-500'>
                          No background image set
                        </span>
                      )}
                    </div>

                    {/* Theme Preview Button */}
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => navigate('/theme-preview')}
                    >
                      <Eye className='mr-2 h-4 w-4' />
                      Make Preview Image
                    </Button>
                  </div>
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
            <div className='flex items-center justify-center p-8'>
              <span>Error rendering theme page</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
}
