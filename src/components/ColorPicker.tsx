import { useWorkingThemeAutoApply } from '@/hooks/useWorkingThemeAutoApply';
import { useWorkingThemeState } from '@/hooks/useWorkingThemeState';
import { rgbToHsl } from '@/lib/utils';
import { RgbColorPicker } from 'react-colorful';

interface ColorPickerProps {
  className?: string;
}

export function ColorPicker({ className = '' }: ColorPickerProps) {
  const { getThemeColor, setThemeColor } = useWorkingThemeState();
  const { isWorkingThemeSelected } = useWorkingThemeAutoApply();

  const color = getThemeColor();
  const disabled = !isWorkingThemeSelected;
  return (
    <div
      className={`space-y-4 ${className} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <div className='flex justify-center'>
        <RgbColorPicker
          color={color}
          onChange={disabled ? undefined : setThemeColor}
          style={{ width: '200px', height: '200px' }}
        />
      </div>
      <div className='text-center'>
        <div
          className='w-16 h-16 mx-auto rounded-lg border-2 border-border shadow-sm'
          style={{
            backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b})`,
          }}
        />
        <div className='mt-2 space-y-1'>
          <p className='text-sm text-muted-foreground'>
            RGBA({color.r}, {color.g}, {color.b})
          </p>
          <p className='text-sm text-muted-foreground'>
            {(() => {
              const hsl = rgbToHsl(color.r, color.g, color.b);
              return `HSL(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
            })()}
          </p>
        </div>
      </div>
    </div>
  );
}
