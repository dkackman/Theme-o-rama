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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppWindow, Info } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export default function Dialogs() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const schema = z.object({
    spoons: z
      .string()
      .min(1, 'At least one spoon is required')
      .max(10, 'No more than 10 spoons'),
    combineFee: z.string().min(1, 'Not enough funds to cover the fee'),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  try {
    return (
      <Layout>
        <Header title='Dialogs' />

        <div className='flex-1 overflow-auto'>
          <div className='container mx-auto p-6 space-y-8'>
            {/* Current Theme Info */}
            <Card>
              <CardHeader>
                <CardTitle>Dialogs Theme</CardTitle>
                <CardDescription>
                  Preview of the current theme&apos;s dialogs and alerts.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <Alert variant='destructive'>
                  <Info className='h-4 w-4' />
                  <AlertDescription>This is an alert.</AlertDescription>
                </Alert>
                <Button
                  variant='outline'
                  onClick={() => {
                    setDialogOpen(true);
                  }}
                >
                  <AppWindow className='mr-2 h-4 w-4' />
                  Open Dialog
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog</DialogTitle>
              <DialogDescription>This is a dialog.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form className='space-y-4'>
                <FormField
                  name='combineFee'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of spoons</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className='gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type='submit'>Ok</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
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
