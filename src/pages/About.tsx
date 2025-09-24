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
import { Copy, Github, Info, Package } from 'lucide-react';
import { toast } from 'react-toastify';
import schemaJson from 'theme-o-rama/schema.json';

export default function About() {
  const handleCopySchema = () => {
    navigator.clipboard.writeText(JSON.stringify(schemaJson, null, 2));
    toast.success('Schema copied to clipboard');
  };

  try {
    return (
      <Layout>
        <Header title='About ' />

        <div className='flex-1 overflow-auto'>
          <div className='container mx-auto p-6 space-y-8'>
            {/* Current Theme Info */}
            <Card>
              <CardHeader>
                <CardTitle>More Information</CardTitle>
                <CardDescription>
                  More information about theme-a-roo.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div>
                  <Button variant='link' asChild>
                    <a
                      href='https://github.com/dkackman/theme-a-roo'
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      <Github className='h-4 w-4 mr-2' /> Theme-a-roo github
                      repo
                    </a>
                  </Button>
                </div>{' '}
                <div>
                  <Button variant='link' asChild>
                    <a
                      href='https://github.com/dkackman/theme-o-rama'
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      <Github className='h-4 w-4 mr-2' /> Theme-o-rama github
                      repo
                    </a>
                  </Button>
                </div>
                <div>
                  <Button variant='link' asChild>
                    <a
                      href='https://www.npmjs.com/package/theme-o-rama'
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      <Package className='h-4 w-4 mr-2' /> npmjs package
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* JSON Schema Viewer */}
            <Card>
              <CardHeader>
                <CardTitle>Theme JSON Schema</CardTitle>
                <CardDescription>
                  View the JSON schema that defines the structure of theme
                  files.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex justify-between items-center'>
                  <Button variant='outline' onClick={handleCopySchema}>
                    <Copy className='h-4 w-4 mr-2' />
                    Copy Schema
                  </Button>
                </div>

                <div className='border rounded-md overflow-hidden'>
                  <textarea
                    value={JSON.stringify(schemaJson, null, 2)}
                    readOnly
                    className='w-full min-h-[300px] overflow-auto resize-none'
                    style={{
                      border: 'none',
                      fontFamily:
                        'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                      fontSize: 14,
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                      overflow: 'auto',
                      whiteSpace: 'pre',
                      width: '100%',
                    }}
                  />
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
