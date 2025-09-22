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
import { useWorkingTheme } from '@/hooks/useWorkingTheme';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
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

  const [isActionsPanelMinimized, setIsActionsPanelMinimized] =
    useLocalStorage<boolean>('theme-o-rama-actions-panel-minimized', false);

  try {
    return (
      <Layout>
        <Header title='Theme Editor' />

        <div className='flex-1 overflow-auto'>
          <div className='container mx-auto p-6 space-y-6'>
            {/* Visual Editor */}
            <div className='space-y-4'>
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
            </div>

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
