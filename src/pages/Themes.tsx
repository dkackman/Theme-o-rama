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
import { isTauriEnvironment } from '@/lib/utils';
import { open } from '@tauri-apps/plugin-dialog';
import { readTextFile } from '@tauri-apps/plugin-fs';
import {
  Check,
  Eye,
  FolderOpen,
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
  const { isLoading, setTheme, setCustomTheme, reloadThemes } = useTheme();
  const { addError } = useErrors();
  const navigate = useNavigate();
  const [themeJson, setThemeJson] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [validationState, setValidationState] = useState<
    'none' | 'valid' | 'invalid'
  >('none');
  const [isTauri, setIsTauri] = useState(false);

  // Load theme JSON, background image, and maximized state from localStorage on component mount
  useEffect(() => {
    const savedThemeJson = localStorage.getItem('custom-theme-json');
    if (savedThemeJson) {
      setThemeJson(savedThemeJson);
    }

    const savedBackgroundImage = localStorage.getItem('background-image');
    if (savedBackgroundImage) {
      setBackgroundImage(savedBackgroundImage);
    }

    const savedMaximized = localStorage.getItem('themes-editor-maximized');
    if (savedMaximized !== null) {
      setIsMaximized(savedMaximized === 'true');
    }

    // Detect Tauri environment
    setIsTauri(isTauriEnvironment());
  }, []);

  // Save theme JSON to localStorage whenever it changes
  const updateThemeJson = (value: string) => {
    setThemeJson(value);
    setValidationState('none'); // Reset validation state when JSON changes
  };

  const handleApplyTheme = async () => {
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
      const success = await setCustomTheme(themeJson);
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

  const handleWebFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target?.result as string;

        try {
          setValidationState('none');
          updateThemeJson(fileContent);
          localStorage.setItem('custom-theme-json', fileContent);
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

            // Update the textarea with the file content
            updateThemeJson(fileContent);

            // Save to localStorage
            localStorage.setItem('custom-theme-json', fileContent);

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
                    onClick={() => {
                      const newMaximized = !isMaximized;
                      setIsMaximized(newMaximized);
                      localStorage.setItem(
                        'themes-editor-maximized',
                        newMaximized.toString(),
                      );
                    }}
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
                <textarea
                  value={themeJson}
                  onChange={(e) => setThemeJson(e.target.value)}
                  //onKeyDown={handleKeyDown}
                  className={`w-full p-3 border border-gray-300 rounded font-mono text-sm bg-gray-50 resize-y ${
                    isMaximized ? 'flex-1 min-h-0' : 'h-80'
                  }`}
                  style={{
                    fontFamily:
                      'Monaco, Menlo, Ubuntu Mono, Consolas, source-code-pro, monospace',
                    tabSize: 4,
                    MozTabSize: 4,
                    fontSize: 14,
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    whiteSpace: 'pre',
                    ...(isMaximized && {
                      minHeight: '400px',
                      height: '100%',
                    }),
                  }}
                  spellCheck={false}
                  autoComplete='off'
                  autoCorrect='off'
                  autoCapitalize='off'
                />

                <div className='flex flex-col sm:flex-row gap-2'>
                  <div className='flex flex-col sm:flex-row gap-2'>
                    <Button
                      onClick={async () => await handleApplyTheme()}
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
                    onClick={handleOpenTheme}
                    variant='outline'
                    className='w-full sm:w-auto sm:ml-auto'
                  >
                    <FolderOpen className='mr-2 h-4 w-4' />
                    Open Theme
                  </Button>
                </div>

                {/* Hidden file input for web environment */}
                <input
                  type='file'
                  accept='.json,application/json'
                  onChange={handleWebFileUpload}
                  className='hidden'
                  id='theme-file-input'
                />

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
