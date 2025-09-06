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
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { Info } from 'lucide-react';

export default function Mint() {
  try {
    return (
      <Layout>
        <Header title='Dialogs' />

        <div className='flex-1 overflow-auto'>
          <div className='container mx-auto p-6 space-y-8'>
            {/* Current Theme Info */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Trans>Mint Sage Compatible Theme NFT</Trans>
                </CardTitle>
                <CardDescription>
                  <Trans>Soon</Trans>
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'></CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  } catch (error) {
    console.error('Error rendering theme page:', error);
    return (
      <Layout>
        <Header title={t`Themes`} />
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
