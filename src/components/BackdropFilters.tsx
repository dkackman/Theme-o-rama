import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useWorkingThemeAutoApply } from '@/hooks/useWorkingThemeAutoApply';
import { useWorkingThemeState } from '@/hooks/useWorkingThemeState';

export function BackdropFilters() {
  const { getBackdropFilters, setBackdropFilters, getBackgroundImage } =
    useWorkingThemeState();
  const { isWorkingThemeSelected } = useWorkingThemeAutoApply();

  const backdropFilters = getBackdropFilters();
  const backgroundImage = getBackgroundImage();
  const disabled = !isWorkingThemeSelected || !backgroundImage;

  return (
    <div className='space-y-3'>
      <div className='flex items-center space-x-2'>
        <Checkbox
          id='backdropFilters'
          checked={backdropFilters}
          onCheckedChange={
            disabled
              ? () => undefined
              : (checked) => setBackdropFilters(checked === true)
          }
          disabled={disabled}
        />
        <Label
          htmlFor='backdropFilters'
          className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
        >
          Enable backdrop filters
        </Label>
      </div>
      <p className='text-xs text-muted-foreground'>
        {!backgroundImage
          ? 'Requires a background image to enable backdrop filters'
          : 'Adds blur effect to cards, popups, and other UI elements'}
      </p>
    </div>
  );
}
