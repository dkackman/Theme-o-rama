import Header from '@/components/Header';
import Layout from '@/components/Layout';
import { ThemeActions } from '@/components/ThemeActions';
import { ThemeCard } from '@/components/ThemeCard';
import { ThemeSelector } from '@/components/ThemeSelector';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useWorkingThemeAutoApply } from '@/hooks/useWorkingThemeAutoApply';
import { useWorkingThemeState } from '@/hooks/useWorkingThemeState';
import { STORAGE_KEYS } from '@/lib/constants';
import {
  Captions,
  ChevronDown,
  ChevronUp,
  Loader2,
  Palette,
} from 'lucide-react';
import { useTheme } from 'theme-o-rama';
import { useLocalStorage } from 'usehooks-ts';

export default function Themes() {
  const { currentTheme, setCustomTheme, isLoading } = useTheme();
  const { getInitializedWorkingTheme } = useWorkingThemeState();
  const { isWorkingThemeSelected } = useWorkingThemeAutoApply();

  const [isActionsPanelMinimized, setIsActionsPanelMinimized] =
    useLocalStorage<boolean>(STORAGE_KEYS.ACTIONS_PANEL_MINIMIZED, false);

  const handleApplyWorkingTheme = () => {
    const workingThemeJson = JSON.stringify(getInitializedWorkingTheme());
    if (workingThemeJson && workingThemeJson.trim()) {
      setCustomTheme(workingThemeJson);
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
            {/* Actions Panel */}
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
                <div>
                  <CardTitle className='flex items-center gap-2'>
                    <Captions className='h-5 w-5' />
                    Actions
                  </CardTitle>
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
                  <ThemeActions />
                </CardContent>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='flex items-center gap-2'>
                      <Palette className='h-5 w-5' />
                      Choose a Theme
                    </CardTitle>
                    <CardDescription>
                      Pick up where you left off or start with one of these
                      example themes
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-6'>
                  {/* Working Theme Card */}
                  <div>
                    <h3 className='text-sm font-medium mb-3'>
                      Work in Progress
                    </h3>
                    <ThemeCard
                      theme={getInitializedWorkingTheme()}
                      currentTheme={currentTheme}
                      isSelected={
                        isWorkingThemeSelected ||
                        currentTheme?.name === 'my-custom-theme'
                      }
                      onSelect={() => handleApplyWorkingTheme()}
                    />
                  </div>

                  <ThemeSelector />
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
