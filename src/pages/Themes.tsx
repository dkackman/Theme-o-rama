import Header from '@/components/Header';
import Layout from '@/components/Layout';
import { ThemeSelector } from '@/components/ThemeSelector';
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
import { Textarea } from '@/components/ui/textarea';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import {
  Copy,
  Info,
  Loader2,
  Maximize2,
  Minimize2,
  Palette,
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
  const [themeJson, setThemeJson] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  // Load theme JSON from localStorage on component mount
  useEffect(() => {
    const savedThemeJson = localStorage.getItem('custom-theme-json');
    if (savedThemeJson) {
      setThemeJson(savedThemeJson);
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

  const handleApplyTheme = async () => {
    if (!themeJson.trim()) {
      setApplyError('Please enter theme JSON');
      return;
    }

    setIsApplying(true);
    setApplyError(null);

    try {
      const success = await setCustomTheme(themeJson);
      if (success) {
        // Keep the JSON in the textarea for easy reapplication
        setApplyError(null);
      } else {
        setApplyError('Failed to apply theme. Please check your JSON format.');
      }
    } catch (err) {
      setApplyError('An error occurred while applying the theme');
      console.error('Error applying theme:', err);
    } finally {
      setIsApplying(false);
    }
  };

  const handleClearTheme = async () => {
    setThemeJson('');
    setApplyError(null);
    localStorage.removeItem('custom-theme-json');
    await setTheme('light');
  };

  const handleCopyCurrentTheme = () => {
    if (currentTheme) {
      const themeJsonString = JSON.stringify(currentTheme, null, 2);
      updateThemeJson(themeJsonString);
      setApplyError(null);
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

  if (error) {
    return (
      <Layout>
        <Header title='Theme' />
        <div className='flex-1 overflow-auto'>
          <div className='container mx-auto p-6'>
            <Alert variant='destructive'>
              <Info className='h-4 w-4' />
              <AlertDescription>
                <Trans>Error loading themes</Trans>: {error}
              </AlertDescription>
            </Alert>
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
            <Alert>
              <Info className='h-4 w-4' />
              <AlertDescription>
                <Trans>No theme available</Trans>
              </AlertDescription>
            </Alert>
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

                {applyError && (
                  <Alert variant='destructive'>
                    <Info className='h-4 w-4' />
                    <AlertDescription>{applyError}</AlertDescription>
                  </Alert>
                )}

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
