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
import { DataTable } from '@/components/ui/data-table';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { ColumnDef } from '@tanstack/react-table';
import { Info } from 'lucide-react';

// Add this interface for the demo table
interface DemoTableData {
  id: string;
  name: string;
  status: string;
  value: number;
}

// Add demo table columns
const demoColumns: ColumnDef<DemoTableData>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    accessorKey: 'value',
    header: 'Value',
  },
];

// Add demo table data
const demoTableData: DemoTableData[] = [
  { id: '1', name: 'Item 1', status: 'Active', value: 100 },
  { id: '2', name: 'Item 2', status: 'Inactive', value: 250 },
  { id: '3', name: 'Item 3', status: 'Active', value: 75 },
  { id: '4', name: 'Item 4', status: 'Pending', value: 300 },
];

export default function Tables() {
  try {
    return (
      <Layout>
        <Header title='Tables' />

        <div className='flex-1 overflow-auto'>
          <div className='container mx-auto p-6 space-y-8'>
            {/* Current Theme Info */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Trans>Tables Theme</Trans>
                </CardTitle>
                <CardDescription>
                  <Trans>
                    Preview of the current theme&apos;s color palette and
                    styling for tables.
                  </Trans>
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='rounded-md border'>
                  <DataTable
                    columns={demoColumns}
                    data={demoTableData}
                    rowLabel='item'
                    rowLabelPlural='items'
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
        <Header title={t`Themes`} back={() => window.history.back()} />
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
