import { BackgroundImageEditor } from '@/components/BackgroundImageEditor';
import { ColorPicker } from '@/components/ColorPicker';
import Header from '@/components/Header';
import Layout from '@/components/Layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useWorkingTheme } from '@/hooks/useWorkingTheme';
import { Info } from 'lucide-react';

export default function BackgroundEditor() {
  const {
    selectedColor,
    colorPickerColor,
    backgroundImage,
    backdropFilters,
    handleColorPickerChange,
    handleBackdropFiltersChange,
    handleBackgroundImageChange,
  } = useWorkingTheme();

  try {
    return (
      <Layout>
        <Header title='Background Editor' />

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
