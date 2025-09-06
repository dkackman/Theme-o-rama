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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Copy,
  LinkIcon,
  MoreVertical,
  SendIcon,
  UserRoundPlus,
} from 'lucide-react';

export default function Components() {
  try {
    return (
      <Layout>
        <Header title='Components' />

        <div className='flex-1 overflow-auto'>
          <div className='container mx-auto p-6 space-y-8'>
            <Card>
              <CardHeader>
                <CardTitle>
                  <Trans>Cards</Trans>
                </CardTitle>
                <CardDescription>
                  <Trans>This is a card</Trans>
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Color Palette */}
                <div>
                  <Label className='text-base font-semibold mb-3 block'></Label>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>
                  <Trans>Components</Trans>
                </CardTitle>
                <CardDescription>
                  <Trans>
                    Preview of the current theme&apos;s color palette and
                    styling for controls and components.
                  </Trans>
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Color Palette */}
                <div>
                  <Separator className='my-1' />

                  <Label className='text-base font-semibold mb-3 block'>
                    <Trans>Colors</Trans>
                  </Label>
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                    <div className='space-y-2'>
                      <Label>
                        <Trans>Primary</Trans>
                      </Label>
                      <div className='h-12 rounded-md border bg-primary' />
                    </div>
                    <div className='space-y-2'>
                      <Label>
                        <Trans>Secondary</Trans>
                      </Label>
                      <div className='h-12 rounded-md border bg-secondary' />
                    </div>
                    <div className='space-y-2'>
                      <Label>
                        <Trans>Accent</Trans>
                      </Label>
                      <div className='h-12 rounded-md border bg-accent' />
                    </div>
                    <div className='space-y-2'>
                      <Label>
                        <Trans>Destructive</Trans>
                      </Label>
                      <div className='h-12 rounded-md border bg-destructive' />
                    </div>
                  </div>
                </div>

                {/* Border Radius */}
                <div>
                  <Label className='text-base font-semibold mb-3 block'>
                    <Trans>Border Radius</Trans>
                  </Label>
                  <div className='space-y-4'>
                    <div>
                      <Trans>Border Radius</Trans>:{' '}
                      <div className='mt-2 flex gap-2'>
                        <div className='w-8 h-8 bg-primary rounded-none' />
                        <div className='w-8 h-8 bg-primary rounded-sm' />
                        <div className='w-8 h-8 bg-primary rounded-md' />
                        <div className='w-8 h-8 bg-primary rounded-lg' />
                        <div className='w-8 h-8 bg-primary rounded-xl' />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className='text-base font-semibold mb-3 block'>
                    <Trans>Component Examples</Trans>
                  </Label>
                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='outline'
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>Drop down menu</span>
                          <MoreVertical
                            className='h-5 w-5'
                            aria-hidden='true'
                          />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuGroup>
                          <DropdownMenuItem className='cursor-pointer'>
                            <SendIcon
                              className='mr-2 h-4 w-4'
                              aria-hidden='true'
                            />
                            <span>
                              <Trans>Transfer</Trans>
                            </span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className='cursor-pointer'
                            disabled={true}
                          >
                            <UserRoundPlus
                              className='mr-2 h-4 w-4'
                              aria-hidden='true'
                            />
                            <span>Disabled</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem className='cursor-pointer'>
                            <LinkIcon
                              className='mr-2 h-4 w-4'
                              aria-hidden='true'
                            />
                            <span>
                              <Trans>Item </Trans>
                            </span>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem className='cursor-pointer'>
                            <Copy className='mr-2 h-4 w-4' aria-hidden='true' />
                            <span>
                              <Trans>Copy </Trans>
                            </span>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className='space-y-4'>
                    <div className='mt-4'>
                      <Input placeholder={t`Input field`} />
                    </div>

                    <div className='flex items-center gap-2 my-2'>
                      <label htmlFor='toggleExample'>
                        <Trans>Toggle Switch</Trans>
                      </label>
                      <Switch id='toggleExample' />
                    </div>
                    <div>
                      <label htmlFor='checkboxExample' className='mr-2'>
                        <Trans>Checkbox</Trans>
                      </label>
                      <Checkbox id='checkboxExample' />
                    </div>
                    <div>
                      <label htmlFor='selectExample' className='mr-2'>
                        <Trans>Select</Trans>
                      </label>
                      <Select>
                        <SelectTrigger id='selectExample'>
                          <SelectValue placeholder={t`Select a value`} />
                        </SelectTrigger>
                        <SelectContent className='max-w-[var(--radix-select-trigger-width)]'>
                          <SelectItem key='none' value='none'>
                            <Trans>None</Trans>
                          </SelectItem>
                          <SelectItem key='one' value='one'>
                            <Trans>One</Trans>
                          </SelectItem>
                          <SelectItem key='two' value='two'>
                            <Trans>Two</Trans>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='space-y-4'>
                      <Label className='text-base font-semibold block'>
                        <Trans>Buttons</Trans>
                      </Label>
                      <div className='flex flex-col sm:flex-row gap-2 flex-wrap'>
                        <Button>
                          <Trans>Primary</Trans>
                        </Button>
                        <Button variant='outline'>
                          <Trans>Outline</Trans>
                        </Button>
                        <Button variant='destructive'>
                          <Trans>Destructive</Trans>
                        </Button>
                        <Button variant='ghost'>
                          <Trans>Ghost</Trans>
                        </Button>
                        <Button variant='link'>
                          <Trans>Link</Trans>
                        </Button>
                      </div>
                    </div>
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
