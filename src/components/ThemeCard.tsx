import { Check, Copy, Edit, Palette } from 'lucide-react';
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

interface ThemeCardProps {
  theme: Theme | null;
  currentTheme: Theme;
  isSelected: boolean;
  onSelect: (themeName: string) => void;
  variant?: 'default' | 'compact' | 'simple';
  className?: string;
}

export function ThemeCard({
  theme,
  currentTheme,
  isSelected,
  onSelect,
  variant = 'default',
  className = '',
}: ThemeCardProps) {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const copyToClipboard = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent theme selection when clicking copy button

    if (!theme) {
      return;
    }

    try {
      const themeJson = JSON.stringify(theme, null, 2);
      await navigator.clipboard.writeText(themeJson);
      toast.success(`Theme "${theme.displayName}" copied to clipboard!`);
    } catch (error) {
      console.error('Failed to copy theme to clipboard:', error);
      toast.error('Failed to copy theme to clipboard');
    }
  };

  useEffect(() => {
    if (cardRef.current && theme) {
      applyThemeIsolated(theme, cardRef.current);
    }
  }, [theme]);

  // Only apply selection outline as inline style
  const selectionStyle = isSelected
    ? {
        outline: `2px solid ${currentTheme.colors?.primary || 'hsl(220 13% 91%)'}`,
      }
    : {};

  const renderDefaultContent = () => {
    const checkStyles: Record<string, string | undefined> = {};
    if (currentTheme.colors?.primary) {
      checkStyles.color = currentTheme.colors.primary;
    } else {
      checkStyles.color = 'hsl(220 13% 91%)'; // Default gray
    }

    return (
      <div className='p-4'>
        <div className='flex items-center justify-between mb-3'>
          <h3 className='font-medium text-sm text-foreground font-heading'>
            {theme?.displayName || 'Get started'}
          </h3>
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
            {isSelected && <Check className='h-4 w-4' style={checkStyles} />}
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
          {theme && (
            <div className='text-xs truncate text-muted-foreground font-body'>
              {theme.fonts?.heading?.split(',')[0] || 'Default'}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSimpleContent = () => {
    const checkStyles: Record<string, string | undefined> = {};
    if (currentTheme.colors?.primary) {
      checkStyles.color = currentTheme.colors.primary;
    } else {
      checkStyles.color = 'currentColor';
    }

    return (
      <div className='p-3'>
        <div className='flex items-center justify-between mb-2'>
          <h4 className='font-medium text-xs text-foreground font-heading'>
            {theme?.displayName || 'Get started'}
          </h4>
          <div className='flex items-center gap-1'>
            <Button
              variant='ghost'
              size='sm'
              onClick={copyToClipboard}
              className='h-5 w-5 p-0 hover:bg-muted'
              title='Copy theme JSON'
            >
              <Copy className='h-2.5 w-2.5' />
            </Button>
            {isSelected && (
              <Check
                className='h-3 w-3'
                style={checkStyles}
                aria-label='Theme selected'
              />
            )}
          </div>
        </div>

        <div className='flex gap-1'>
          <div className='h-2 w-2 bg-primary rounded-sm' />
          <div className='h-2 w-2 bg-secondary rounded-sm' />
          <div className='h-2 w-2 bg-accent rounded-sm' />
        </div>
      </div>
    );
  };

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
        <Button onClick={() => navigate('/json-editor')} size='sm'>
          <Edit className='h-4 w-4 mr-2' />
          Start Designing
        </Button>
      </div>
    );
  }

  return (
    <>
      <div
        ref={cardRef}
        className={`cursor-pointer transition-all hover:opacity-90 text-card-foreground border border-border rounded-lg shadow-card theme-card-isolated ${
          isSelected ? 'ring-2' : 'hover:ring-1'
        } ${className}`}
        style={selectionStyle}
        onClick={() => onSelect(theme?.name || '')}
      >
        {variant === 'simple' ? renderSimpleContent() : renderDefaultContent()}
      </div>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Theme</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the theme &quot;
              {theme?.displayName || ''}&quot;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
