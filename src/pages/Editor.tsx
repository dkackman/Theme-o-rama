import { BackgroundImageEditor } from '@/components/BackgroundImageEditor';
import { ColorPicker } from '@/components/ColorPicker';
import Header from '@/components/Header';
import Layout from '@/components/Layout';
import { ThemeActions } from '@/components/ThemeActions';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { useWorkingTheme } from '@/hooks/useWorkingTheme';
import { Info } from 'lucide-react';

export default function Editor() {
  const {
    workingThemeJson,
    updateWorkingTheme,
    updateWorkingThemeFromJson,
    clearWorkingTheme,
    selectedColor,
    colorPickerColor,
    backgroundImage,
    setBackgroundImage,
    themeName,
    setThemeName,
    backdropFilters,
    setBackdropFilters,
    generatedTheme,
    handleColorPickerChange,
  } = useWorkingTheme();

  // UI state (not theme-related)

  const updateThemeJson = (value: string) => {
    updateWorkingThemeFromJson(value);
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
