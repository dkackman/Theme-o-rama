import Header from '@/components/Header';
import Layout from '@/components/Layout';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { applyThemeIsolated, useTheme } from 'theme-o-rama';

export default function ThemePreview() {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (previewRef.current && currentTheme) {
      // Apply the theme with complete isolation from ambient theme
      applyThemeIsolated(currentTheme, previewRef.current);
    }
  }, [currentTheme]);

  const handleBack = () => {
    navigate(-1);
  };

  if (!currentTheme) {
    return (
      <Layout>
        <Header title={t`Theme Preview`} back={handleBack} />
        <div className='flex-1 overflow-auto'>
          <div className='container mx-auto p-6'>
            <div className='flex items-center justify-center p-8'>
              <span>
                <Trans>No theme available</Trans>
              </span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header title={t`Theme Preview`} back={handleBack} />
      <div className='flex-1 overflow-auto backdrop-blur-sm bg-background/80'>
        <div className='container mx-auto p-6'>
          <div className='flex flex-col items-center space-y-6'>
            <div className='text-center'>
              <h2 className='text-2xl font-bold mb-2'>
                <Trans>Current Theme Preview</Trans>
              </h2>
              <p className='text-muted-foreground'>
                <Trans>A larger preview of your currently active theme</Trans>
              </p>
            </div>

            {/* Large Square Theme Preview */}
            <div
              ref={previewRef}
              className='w-80 h-80 max-w-full aspect-square border border-border rounded-none shadow-lg theme-card-isolated'
            >
              <div className='p-6 h-full flex flex-col'>
                {/* Header */}
                <div className='flex items-center justify-between mb-6'>
                  <h3 className='font-bold text-lg text-foreground font-heading'>
                    {currentTheme.displayName}
                  </h3>
                  <div className='w-6 h-6 bg-primary rounded-full relative'>
                    <span
                      className='text-primary-foreground text-xs font-bold absolute inset-0 flex items-center justify-center'
                      style={{ lineHeight: '1', transform: 'translateY(-1px)' }}
                    >
                      {' '}
                    </span>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className='flex-1 space-y-4'>
                  {/* Primary Button */}
                  <div className='h-12 px-4 bg-primary text-primary-foreground rounded-lg shadow-button relative'>
                    <span
                      className='font-medium font-body absolute inset-0 flex items-center'
                      style={{ lineHeight: '1', transform: 'translateY(-1px)' }}
                    >
                      {' '}
                    </span>
                  </div>

                  {/* Color Palette */}
                  <div className='space-y-2'>
                    <h4 className='text-sm font-medium text-foreground font-heading'>
                      <Trans>Color Palette</Trans>
                    </h4>
                    <div className='grid grid-cols-4 gap-2'>
                      <div className='h-8 bg-primary rounded-md relative'>
                        <span
                          className='text-primary-foreground text-xs font-bold absolute inset-0 flex items-center justify-center'
                          style={{
                            lineHeight: '1',
                            transform: 'translateY(-1px)',
                          }}
                        >
                          {' '}
                        </span>
                      </div>
                      <div className='h-8 bg-secondary rounded-md relative'>
                        <span
                          className='text-secondary-foreground text-xs font-bold absolute inset-0 flex items-center justify-center'
                          style={{
                            lineHeight: '1',
                            transform: 'translateY(-1px)',
                          }}
                        >
                          {' '}
                        </span>
                      </div>
                      <div className='h-8 bg-accent rounded-md relative'>
                        <span
                          className='text-accent-foreground text-xs font-bold absolute inset-0 flex items-center justify-center'
                          style={{
                            lineHeight: '1',
                            transform: 'translateY(-1px)',
                          }}
                        >
                          {' '}
                        </span>
                      </div>
                      <div className='h-8 bg-destructive rounded-md relative'>
                        <span
                          className='text-destructive-foreground text-xs font-bold absolute inset-0 flex items-center justify-center'
                          style={{
                            lineHeight: '1',
                            transform: 'translateY(-1px)',
                          }}
                        >
                          {' '}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sample Card */}
                  <div className='bg-card text-card-foreground border border-border rounded-lg p-3'>
                    <div className='text-sm font-medium font-heading mb-1'>
                      {' '}
                    </div>
                    <div className='text-xs text-muted-foreground font-body'></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Theme Info */}
            <div className='text-center max-w-md'>
              <div className='text-sm text-muted-foreground'>
                {/* Footer */}
                <div className='mt-4 pt-4 border-t border-border'>
                  <div className='text-xs text-muted-foreground font-body text-center'>
                    <Trans>Theme Preview</Trans>
                  </div>
                </div>
                <Trans>
                  This theme preview shows how your theme will look so you can
                  share it with others.
                </Trans>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
