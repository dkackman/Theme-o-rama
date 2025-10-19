import Header from '@/components/Header';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { isTauriEnvironment } from '@/lib/utils';
import html2canvas from 'html2canvas-pro';
import { Download } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
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

  const downloadForWeb = (canvas: HTMLCanvasElement, filename: string) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Theme preview saved to Downloads folder.`);
  };

  const downloadForTauri = async (
    canvas: HTMLCanvasElement,
    filename: string,
  ) => {
    if (!isTauriEnvironment()) {
      throw new Error('Tauri environment not detected');
    }

    try {
      const { save } = await import('@tauri-apps/plugin-dialog');
      const { writeFile } = await import('@tauri-apps/plugin-fs');

      const filePath = await save({
        defaultPath: filename,
        filters: [
          {
            name: 'PNG Images',
            extensions: ['png'],
          },
        ],
      });

      if (filePath) {
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
          }, 'image/png');
        });

        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        await writeFile(filePath, uint8Array);
        toast.success(`Theme preview saved.`);
      } else {
        // User cancelled the save dialog
        toast.info('Download cancelled');
      }
    } catch (error) {
      console.error('Error saving theme preview:', error);
      toast.error('Failed to save theme preview. Please try again.');
      throw error; // Re-throw to be caught by the main handler
    }
  };

  const handleDownload = async () => {
    if (!previewRef.current || !currentTheme) return;

    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: null,
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: false,
        logging: false,
      });

      const filename = `${currentTheme.displayName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_theme_preview.png`;

      if (isTauriEnvironment()) {
        await downloadForTauri(canvas, filename);
      } else {
        downloadForWeb(canvas, filename);
      }
    } catch (error) {
      console.error('Error generating theme preview:', error);
      toast.error('Failed to generate theme preview. Please try again.');
    }
  };

  if (!currentTheme) {
    return (
      <Layout>
        <Header title='Theme Preview' back={handleBack} />
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

  return (
    <Layout>
      <Header title='Theme Preview' back={handleBack} />
      <div className='flex-1 overflow-auto backdrop-blur-sm bg-background/80'>
        <div className='container mx-auto p-6'>
          <div className='flex flex-col items-center space-y-6'>
            <div className='text-center'>
              <h2 className='text-2xl font-bold mb-2'>
                Current Theme Preview recently{' '}
              </h2>
              <p className='text-muted-foreground mb-4'>
                A larger preview of your currently active theme. Check the
                output carefully as it may not be perfect.
              </p>
              <Button onClick={handleDownload} className='mb-4'>
                <Download className='w-4 h-4 mr-2' />
                Download PNG
              </Button>
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
                      Color Palette
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
                    Theme Preview
                  </div>
                </div>
                This theme preview shows how your theme will look so you can
                share it with others.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
