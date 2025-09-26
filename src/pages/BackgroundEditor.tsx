import { BackdropFilters } from '@/components/BackdropFilters';
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
import { useWorkingThemeAutoApply } from '@/hooks/useWorkingThemeAutoApply';
import { Info } from 'lucide-react';

export default function BackgroundEditor() {
  const { isWorkingThemeSelected } = useWorkingThemeAutoApply();

  try {
    return (
      <Layout>
        <Header title='Background Editor' />

        <div className='flex-1 overflow-auto'>
          <div className='container mx-auto p-6 space-y-6'>
            {/* Readonly Notice */}
            {!isWorkingThemeSelected && (
              <Alert>
                <Info className='h-4 w-4' />
                <AlertDescription>
                  You are viewing an example theme. Switch to the working theme
                  to make edits.
                </AlertDescription>
              </Alert>
            )}

            {/* Visual Editor */}
            <div className='space-y-4'>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* Left Column - Color and Filters */}
                <div className='space-y-6'>
                  {/* Color Picker */}
                  <Card
                    className={`${!isWorkingThemeSelected ? 'opacity-50' : ''}`}
                  >
                    <CardHeader>
                      <CardTitle className='text-lg'>Color Selection</CardTitle>
                      <CardDescription>
                        Choose your theme&apos;s base color
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ColorPicker />
                    </CardContent>
                  </Card>

                  {/* Backdrop Filters */}
                  <Card
                    className={`${!isWorkingThemeSelected ? 'opacity-50' : ''}`}
                  >
                    <CardHeader>
                      <CardTitle className='text-lg'>
                        Backdrop Filters
                      </CardTitle>
                      <CardDescription>
                        Control blur effects on UI elements
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <BackdropFilters />
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Background Image */}
                <Card
                  className={`${!isWorkingThemeSelected ? 'opacity-50' : ''}`}
                >
                  <CardHeader>
                    <CardTitle className='text-lg'>Background Image</CardTitle>
                    <CardDescription>
                      Link to, upload or generate a background image
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <BackgroundImageEditor />
                  </CardContent>
                </Card>
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
