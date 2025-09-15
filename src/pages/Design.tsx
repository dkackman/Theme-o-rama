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
import { Info, MessageSquare, Palette, Save } from 'lucide-react';
import { useState } from 'react';
import { RgbaColorPicker } from 'react-colorful';
import { toast } from 'react-toastify';

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
  const [selectedColor, setSelectedColor] = useState({
    r: 59,
    g: 130,
    b: 246,
    a: 1,
  });
  const [currentStep, setCurrentStep] = useState(1);

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

  const handleSave = () => {
    // TODO: Implement save functionality
    toast.success('Theme saved successfully!');
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
                Select a color that will serve as the foundation for your theme
              </p>
            </div>

            <div className='flex justify-center'>
              <div className='space-y-4'>
                <RgbaColorPicker
                  color={selectedColor}
                  onChange={setSelectedColor}
                  style={{ width: '200px', height: '200px' }}
                />
                <div className='text-center'>
                  <div
                    className='w-16 h-16 mx-auto rounded-lg border-2 border-border shadow-sm'
                    style={{
                      backgroundColor: `rgba(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b}, ${selectedColor.a})`,
                    }}
                  />
                  <div className='mt-2 space-y-1'>
                    <p className='text-sm text-muted-foreground'>
                      RGBA({selectedColor.r}, {selectedColor.g},{' '}
                      {selectedColor.b}, {selectedColor.a.toFixed(2)})
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
                Describe the style and mood you want for your theme
              </p>
            </div>

            <div className='text-center py-12'>
              <MessageSquare className='h-16 w-16 mx-auto text-muted-foreground mb-4' />
              <p className='text-muted-foreground'>
                Prompt input will be implemented here
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <h3 className='text-lg font-semibold mb-2'>Save Your Theme</h3>
              <p className='text-muted-foreground mb-6'>
                Review your theme and save it to your collection
              </p>
            </div>

            <div className='text-center py-12'>
              <Save className='h-16 w-16 mx-auto text-muted-foreground mb-4' />
              <p className='text-muted-foreground'>
                Save functionality will be implemented here
              </p>
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
                    <Button onClick={handleSave}>
                      <Save className='h-4 w-4 mr-2' />
                      Save Theme
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
