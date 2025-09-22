import { BackgroundImageEditor } from '@/components/BackgroundImageEditor';
import { ColorPicker } from '@/components/ColorPicker';
import Header from '@/components/Header';
import Layout from '@/components/Layout';
import { ThemeActions } from '@/components/ThemeActions';
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
import { ChevronDown, ChevronUp, Info, Loader2, Upload } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTheme } from 'theme-o-rama';
import { useLocalStorage } from 'usehooks-ts';

export default function Editor() {
  const {
    workingThemeJson,
    updateWorkingTheme,
    updateWorkingThemeFromJson,
    clearWorkingTheme,
    selectedColor,
    colorPickerColor,
    backgroundImage,
    themeName,
    setThemeName,
    backdropFilters,
    generatedTheme,
    handleColorPickerChange,
    handleBackdropFiltersChange,
    handleBackgroundImageChange,
  } = useWorkingTheme();

  const { addError } = useErrors();
  const { setCustomTheme } = useTheme();
  const [isActionsPanelMinimized, setIsActionsPanelMinimized] =
    useLocalStorage<boolean>('theme-o-rama-actions-panel-minimized', false);

  // JSON editor state
  const [jsonEditorValue, setJsonEditorValue] = useState(
    workingThemeJson || '',
  );
  const [isApplyingJson, setIsApplyingJson] = useState(false);
  const [isUserEditingJson, setIsUserEditingJson] = useState(false);

  // Handler for applying JSON editor changes
  const handleApplyJsonTheme = useCallback(() => {
    if (!jsonEditorValue || !jsonEditorValue.trim()) {
      addError({
        kind: 'invalid',
        reason: 'Please enter theme JSON',
      });
      return;
    }

    setIsApplyingJson(true);

    try {
      const success = setCustomTheme(jsonEditorValue);
      if (!success) {
        addError({
          kind: 'invalid',
          reason: 'Failed to apply theme. Please check your JSON format.',
        });
      } else {
        // Update the working theme with the applied JSON
        updateWorkingThemeFromJson(jsonEditorValue);
      }
    } catch (err) {
      addError({
        kind: 'invalid',
        reason: 'An error occurred while applying the theme',
      });
      console.error('Error applying theme:', err);
    } finally {
      setIsApplyingJson(false);
    }
  }, [jsonEditorValue, setCustomTheme, addError, updateWorkingThemeFromJson]);

  // Update JSON editor when working theme changes (from visual updates)
  const updateJsonEditorFromWorkingTheme = useCallback(() => {
    // Only sync if user is not actively editing the JSON
    if (!isUserEditingJson && workingThemeJson !== jsonEditorValue) {
      setJsonEditorValue(workingThemeJson || '');
    }
  }, [workingThemeJson, jsonEditorValue, isUserEditingJson]);

  // Handler for when user starts editing JSON
  const handleJsonEditorChange = useCallback((value: string) => {
    setJsonEditorValue(value);
    setIsUserEditingJson(true);
  }, []);

  // Handler for when user stops editing JSON (on blur)
  const handleJsonEditorBlur = useCallback(() => {
    setIsUserEditingJson(false);
  }, []);

  // Sync JSON editor with working theme changes
  useEffect(() => {
    updateJsonEditorFromWorkingTheme();
  }, [updateJsonEditorFromWorkingTheme]);

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
                    <CardContent>
                      <ColorPicker
                        color={colorPickerColor}
                        onChange={handleColorPickerChange}
                      />
                    </CardContent>
                  </Card>

                  {/* Image Generation */}
                  <BackgroundImageEditor
                    backgroundImageUrl={backgroundImage}
                    onBackgroundImageChange={handleBackgroundImageChange}
                    selectedColor={selectedColor}
                    backdropFilters={backdropFilters}
                    onBackdropFiltersChange={handleBackdropFiltersChange}
                  />
                </div>
              </TabsContent>

              {/* JSON Editor Tab */}
              <TabsContent value='json' className='space-y-4'>
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>JSON Editor</CardTitle>
                    <CardDescription>
                      Edit your theme directly in JSON format. Changes are
                      applied when you click Apply.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <Label htmlFor='theme-json'>Theme JSON</Label>
                      <Button
                        onClick={handleApplyJsonTheme}
                        disabled={isApplyingJson || !jsonEditorValue?.trim()}
                        className='flex items-center gap-2'
                      >
                        {isApplyingJson ? (
                          <>
                            <Loader2 className='h-4 w-4 animate-spin' />
                            Applying...
                          </>
                        ) : (
                          <>
                            <Upload className='h-4 w-4' />
                            Apply Theme
                          </>
                        )}
                      </Button>
                    </div>
                    <Textarea
                      id='theme-json'
                      value={jsonEditorValue}
                      onChange={(e) => handleJsonEditorChange(e.target.value)}
                      onBlur={handleJsonEditorBlur}
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
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
                <div>
                  <CardTitle className='text-lg'>Actions</CardTitle>
                  <CardDescription>
                    Manage your theme with these actions
                  </CardDescription>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() =>
                    setIsActionsPanelMinimized(!isActionsPanelMinimized)
                  }
                  className='h-8 w-8 p-0'
                >
                  {isActionsPanelMinimized ? (
                    <ChevronDown className='h-4 w-4' />
                  ) : (
                    <ChevronUp className='h-4 w-4' />
                  )}
                </Button>
              </CardHeader>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isActionsPanelMinimized
                    ? 'max-h-0 opacity-0'
                    : 'max-h-[1000px] opacity-100'
                }`}
              >
                <CardContent>
                  <ThemeActions
                    workingThemeJson={workingThemeJson}
                    themeName={themeName}
                    generatedTheme={generatedTheme}
                    setThemeName={setThemeName}
                    updateWorkingTheme={updateWorkingTheme}
                    updateWorkingThemeFromJson={updateWorkingThemeFromJson}
                    clearWorkingTheme={clearWorkingTheme}
                  />
                </CardContent>
              </div>
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
