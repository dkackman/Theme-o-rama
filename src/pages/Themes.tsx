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
import { Textarea } from '@/components/ui/textarea';
import { useErrors } from '@/hooks/useErrors';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import {
  Copy,
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
import { useTheme } from 'theme-o-rama';

export default function Themes() {
  const {
    currentTheme,
    isLoading,
    error,
    setTheme,
    setCustomTheme,
    reloadThemes,
  } = useTheme();
  const { addError } = useErrors();
  const [themeJson, setThemeJson] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

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
    if (value.trim()) {
      localStorage.setItem('custom-theme-json', value);
    } else {
      localStorage.removeItem('custom-theme-json');
    }
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
      const themeJsonString = JSON.stringify(currentTheme, null, 2);
      updateThemeJson(themeJsonString);
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
              <span className='ml-2'>
                <Trans>Loading themes...</Trans>
              </span>
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
              <span>
                <Trans>No theme available</Trans>
              </span>
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
                        <Trans>Choose Your Theme</Trans>
                      </CardTitle>
                      <CardDescription>
                        <Trans>
                          Select from our collection of beautiful themes
                        </Trans>
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
                      <Trans>Reload Themes</Trans>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ThemeSelector />
                </CardContent>
              </Card>
            )}

            {/* Custom Theme Input */}
            <Card className={isMaximized ? 'flex-1 flex flex-col' : ''}>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='flex items-center gap-2'>
                      <Upload className='h-5 w-5' />
                      <Trans>Apply Custom Theme</Trans>
                    </CardTitle>
                    <CardDescription>
                      <Trans>
                        Paste your theme JSON below to apply a custom theme to
                        the entire application.
                      </Trans>
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
                className={`space-y-4 ${isMaximized ? 'flex-1 flex flex-col' : ''}`}
              >
                <div
                  className={`space-y-2 ${isMaximized ? 'flex-1 flex flex-col' : ''}`}
                >
                  <Label htmlFor='theme-json'>
                    <Trans>Theme JSON</Trans>
                  </Label>
                  <Textarea
                    id='theme-json'
                    placeholder={t`Paste your theme JSON here...`}
                    value={themeJson}
                    onChange={(e) => updateThemeJson(e.target.value)}
                    className={`font-mono text-sm ${isMaximized ? 'flex-1 min-h-0' : 'min-h-[200px]'}`}
                  />
                </div>

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
                          <Trans>Applying...</Trans>
                        </>
                      ) : (
                        <>
                          <Upload className='mr-2 h-4 w-4' />
                          <Trans>Apply Theme</Trans>
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleClearTheme}
                      variant='outline'
                      className='w-full sm:w-auto'
                    >
                      <X className='mr-2 h-4 w-4' />
                      <Trans>Clear & Reset</Trans>
                    </Button>
                  </div>
                  <Button
                    onClick={handleCopyCurrentTheme}
                    variant='outline'
                    disabled={!currentTheme}
                    className='w-full sm:w-auto sm:ml-auto'
                  >
                    <Copy className='mr-2 h-4 w-4' />
                    <Trans>Insert Current Theme JSON</Trans>
                  </Button>
                </div>

                {/* Background Image Upload Section */}
                <div className='border-t pt-4'>
                  <Label className='text-sm font-medium'>
                    <Trans>Background Image</Trans>
                  </Label>
                  <div className='flex items-center gap-3 mt-2'>
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
                        <Trans>Upload Image</Trans>
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
                        <Trans>No background image set</Trans>
                      </span>
                    )}
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
        <Header title={t`Themes`} />
        <div className='flex-1 overflow-auto'>
          <div className='container mx-auto p-6'>
            <div className='flex items-center justify-center p-8'>
              <span>
                <Trans>Error rendering theme page</Trans>
              </span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
}
