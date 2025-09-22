import { rgbToHsl } from '@/lib/utils';
import { RgbColorPicker } from 'react-colorful';

interface ColorPickerProps {
  color: {
    r: number;
    g: number;
    b: number;
  };
  onChange: (color: { r: number; g: number; b: number }) => void;
  className?: string;
}

export function ColorPicker({
  color,
  onChange,
  className = '',
}: ColorPickerProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className='flex justify-center'>
        <RgbColorPicker
          color={color}
          onChange={onChange}
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
