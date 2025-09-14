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
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Copy,
  Info,
  LinkIcon,
  MoreVertical,
  SendIcon,
  UserRoundPlus,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

export default function Components() {
  try {
    return (
      <Layout>
        <Header title='Components' />

        <div className='flex-1 overflow-auto'>
          <div className='container mx-auto p-6 space-y-8'>
            <Card>
              <CardHeader>
                <CardTitle>Cards</CardTitle>
                <CardDescription>This is a card</CardDescription>
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
                <CardTitle>Components</CardTitle>
                <CardDescription>
                  Preview of the current theme&apos;s color palette and styling
                  for controls and components.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Color Palette */}
                <div>
                  <Separator className='my-1' />

                  <Label className='text-base font-semibold mb-3 block'>
                    Colors
                  </Label>
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                    <div className='space-y-2'>
                      <Label>Primary</Label>
                      <div className='h-12 rounded-md border bg-primary' />
                    </div>
                    <div className='space-y-2'>
                      <Label>Secondary</Label>
                      <div className='h-12 rounded-md border bg-secondary' />
                    </div>
                    <div className='space-y-2'>
                      <Label>Accent</Label>
                      <div className='h-12 rounded-md border bg-accent' />
                    </div>
                    <div className='space-y-2'>
                      <Label>Destructive</Label>
                      <div className='h-12 rounded-md border bg-destructive' />
                    </div>
                  </div>
                </div>

                {/* Border Radius */}
                <div>
                  <Label className='text-base font-semibold mb-3 block'>
                    Border Radius
                  </Label>
                  <div className='space-y-4'>
                    <div>
                      Border Radius:{' '}
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
                    Component Examples
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
                            <span>Transfer</span>
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
                            <span>Item</span>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem className='cursor-pointer'>
                            <Copy className='mr-2 h-4 w-4' aria-hidden='true' />
                            <span>Copy</span>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className='space-y-4'>
                    <div className='mt-4'>
                      <Input placeholder='Input field' />
                    </div>

                    <div className='flex items-center gap-2 my-2'>
                      <label htmlFor='toggleExample'>Toggle Switch</label>
                      <Switch id='toggleExample' />
                    </div>
                    <div>
                      <label htmlFor='checkboxExample' className='mr-2'>
                        Checkbox
                      </label>
                      <Checkbox id='checkboxExample' />
                    </div>
                    <div>
                      <label htmlFor='selectExample' className='mr-2'>
                        Select
                      </label>
                      <Select>
                        <SelectTrigger id='selectExample'>
                          <SelectValue placeholder='Select a value' />
                        </SelectTrigger>
                        <SelectContent className='max-w-[var(--radix-select-trigger-width)]'>
                          <SelectItem key='none' value='none'>
                            None
                          </SelectItem>
                          <SelectItem key='one' value='one'>
                            One
                          </SelectItem>
                          <SelectItem key='two' value='two'>
                            Two
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='space-y-4'>
                      <Label className='text-base font-semibold block'>
                        Buttons
                      </Label>
                      <div className='flex flex-col sm:flex-row gap-2 flex-wrap'>
                        <Button>Primary</Button>
                        <Button variant='outline'>Outline</Button>
                        <Button variant='destructive'>Destructive</Button>
                        <Button variant='ghost'>Ghost</Button>
                        <Button variant='link'>Link</Button>
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
