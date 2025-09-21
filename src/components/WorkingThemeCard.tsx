import { Check, Copy, Edit, Palette, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { applyThemeIsolated, Theme } from 'theme-o-rama';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface WorkingThemeCardProps {
  theme: Theme | null;
  isSelected: boolean;
  onSelect: () => void;
  onClear: () => void;
  className?: string;
}

export function WorkingThemeCard({
  theme,
  isSelected,
  onSelect,
  onClear,
  className = '',
}: WorkingThemeCardProps) {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const copyToClipboard = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent theme selection when clicking copy button

    if (!theme) {
      toast.error('No working theme to copy');
      return;
    }

    try {
      const themeJson = JSON.stringify(theme, null, 2);
      await navigator.clipboard.writeText(themeJson);
      toast.success('Working theme copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy theme to clipboard:', error);
      toast.error('Failed to copy theme to clipboard');
    }
  };

  const handleEditInDesign = () => {
    navigate('/design');
  };

  useEffect(() => {
    if (cardRef.current && theme) {
      // Apply the theme with complete isolation from ambient theme
      applyThemeIsolated(theme, cardRef.current);
    }
  }, [theme]);

  if (!theme) {
    return (
      <div
        className={`border-2 border-dashed border-border rounded-lg p-6 text-center ${className}`}
      >
        <Palette className='h-8 w-8 mx-auto mb-3 text-muted-foreground' />
        <h3 className='font-medium text-sm text-foreground mb-2'>
          No Working Theme
        </h3>
        <p className='text-xs text-muted-foreground mb-4'>
          Start designing a theme to see it here
        </p>
        <Button onClick={handleEditInDesign} size='sm'>
          <Edit className='h-4 w-4 mr-2' />
          Start Designing
        </Button>
      </div>
    );
  }

  // Apply selection outline as inline style
  const selectionStyle = isSelected
    ? {
        outline: '2px solid hsl(220 13% 91%)',
      }
    : {};

  return (
    <>
      <div
        ref={cardRef}
        className={`cursor-pointer transition-all hover:opacity-90 text-card-foreground border border-border rounded-lg shadow-card theme-card-isolated ${
          isSelected ? 'ring-2' : 'hover:ring-1'
        } ${className}`}
        style={selectionStyle}
        onClick={onSelect}
      >
        <div className='p-4'>
          <div className='flex items-center justify-between mb-3'>
            <div className='flex items-center gap-2'>
              <Palette className='h-4 w-4 text-primary' />
              <h3 className='font-medium text-sm text-foreground font-heading'>
                {theme.displayName || 'Working Theme'}
              </h3>
              <span className='text-xs bg-primary/10 text-primary px-2 py-1 rounded-full'>
                Work in Progress
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='sm'
                onClick={copyToClipboard}
                className='h-6 w-6 p-0 hover:bg-muted'
                title='Copy theme JSON'
              >
                <Copy className='h-3 w-3' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditInDesign();
                }}
                className='h-6 w-6 p-0 hover:bg-muted'
                title='Edit in Design page'
              >
                <Edit className='h-3 w-3' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={(e) => {
                  e.stopPropagation();
                  setShowClearConfirm(true);
                }}
                className='h-6 w-6 p-0 hover:bg-muted text-destructive hover:text-destructive'
                title='Clear working theme'
              >
                <Trash2 className='h-3 w-3' />
              </Button>
              {isSelected && <Check className='h-4 w-4 text-primary' />}
            </div>
          </div>

          {/* Theme preview */}
          <div className='space-y-2'>
            <div className='h-8 flex items-center px-2 bg-primary text-primary-foreground rounded-md shadow-button'>
              <span className='text-xs font-medium font-body'>Aa</span>
            </div>
            <div className='flex gap-1'>
              <div className='h-4 w-4 bg-primary rounded-sm' />
              <div className='h-4 w-4 bg-secondary rounded-sm' />
              <div className='h-4 w-4 bg-accent rounded-sm' />
              <div className='h-4 w-4 bg-destructive rounded-sm' />
            </div>
            <div className='text-xs truncate text-muted-foreground font-body'>
              {theme.fonts?.heading?.split(',')[0] || 'Default'}
            </div>
            {theme.backgroundImage && (
              <div className='text-xs text-muted-foreground'>
                📷 Includes background image
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Working Theme</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear your work-in-progress theme? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setShowClearConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={() => {
                setShowClearConfirm(false);
                onClear();
                toast.success('Working theme cleared');
              }}
            >
              Clear Theme
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
