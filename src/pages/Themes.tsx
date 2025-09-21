import Header from '@/components/Header';
import Layout from '@/components/Layout';
import { ThemeSelector } from '@/components/ThemeSelector';
import { WorkingThemeCard } from '@/components/WorkingThemeCard';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useErrors } from '@/hooks/useErrors';
import { useWorkingTheme } from '@/hooks/useWorkingTheme';
import { Loader2, Palette } from 'lucide-react';
import { useTheme } from 'theme-o-rama';

export default function Themes() {
  const { currentTheme, isLoading, setTheme, setCustomTheme, reloadThemes } =
    useTheme();
  const { addError } = useErrors();
  const { workingTheme, workingThemeJson, clearWorkingTheme } =
    useWorkingTheme();
  const handleApplyTheme = () => {
    if (!workingThemeJson || !workingThemeJson.trim()) {
      addError({
        kind: 'invalid',
        reason: 'Please enter theme JSON',
      });
      return;
    }

    try {
      const success = setCustomTheme(workingThemeJson);
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
    }
  };

  const handleClearTheme = () => {
    clearWorkingTheme();
    setTheme('light');
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
          <div className={`container mx-auto p-6 space-y-8`}>
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
                <div className='space-y-6'>
                  {/* Working Theme Card */}
                  <div>
                    <h3 className='text-sm font-medium mb-3'>
                      Work in Progress
                    </h3>
                    <WorkingThemeCard
                      theme={workingTheme}
                      isSelected={currentTheme?.name === workingTheme?.name}
                      onSelect={handleApplyTheme}
                      onClear={handleClearTheme}
                      className='max-w-xs'
                    />
                  </div>

                  {/* Theme Selector */}
                  <div>
                    <h3 className='text-sm font-medium mb-3'>
                      Available Themes
                    </h3>
                    <ThemeSelector />
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
