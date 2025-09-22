import { hasTag } from '@/lib/themes';
import { Loader2 } from 'lucide-react';
import { Theme, useTheme } from 'theme-o-rama';
import { ThemeCard } from './ThemeCard';

export function ThemeSelector() {
  const { currentTheme, setTheme, availableThemes, isLoading, error } =
    useTheme();

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <Loader2 className='h-6 w-6 animate-spin' aria-hidden='true' />
        <span className='ml-2'>Loading themes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center p-8 text-destructive'>
        <p>Error loading themes: {error}</p>
      </div>
    );
  }

  if (!currentTheme) {
    return <div className='text-center p-8'>No theme available</div>;
  }

  const defaultThemes = availableThemes
    .filter((theme: Theme) => !hasTag(theme, 'hidden'))
    .sort((a: Theme, b: Theme) => a.displayName.localeCompare(b.displayName));

  return (
    <div className='space-y-8'>
      {/* Default Themes */}
      {defaultThemes.length > 0 && (
        <div>
          <h3 className='text-lg font-semibold mb-4'>Example Themes</h3>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
            {defaultThemes.map((theme: Theme) => (
              <ThemeCard
                key={theme.name}
                theme={theme}
                currentTheme={currentTheme}
                isSelected={currentTheme.name === theme.name}
                onSelect={setTheme}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ThemeSelectorSimple() {
  const {
    currentTheme,
    setTheme,
    availableThemes,
    isLoading,
    lastUsedNonCoreTheme,
  } = useTheme();

  if (isLoading || !currentTheme) {
    return (
      <div className='space-y-3 p-4'>
        <div className='flex items-center justify-center'>
          <Loader2 className='h-4 w-4 animate-spin' aria-hidden='true' />
          <span className='ml-2 text-sm'>Loading themes...</span>
        </div>
      </div>
    );
  }

  // Get the core themes: light and dark
  const lightTheme = availableThemes.find(
    (theme: Theme) => theme.name === 'light',
  );
  const darkTheme = availableThemes.find(
    (theme: Theme) => theme.name === 'dark',
  );

  // Get the third theme: last used non-core theme or colorful as fallback
  let thirdTheme = null;
  if (lastUsedNonCoreTheme) {
    thirdTheme = availableThemes.find(
      (theme: Theme) => theme.name === lastUsedNonCoreTheme,
    );
  }

  // If no last used non-core theme or it's not available, use colorful as fallback
  if (!thirdTheme) {
    thirdTheme = availableThemes.find(
      (theme: Theme) => theme.name === 'colorful',
    );
  }

  const coreThemes = [lightTheme, darkTheme, thirdTheme].filter(
    (theme): theme is NonNullable<typeof theme> => theme !== undefined,
  );

  return (
    <div className='space-y-3 p-4'>
      <div className='grid grid-cols-3 gap-3'>
        {coreThemes.map((theme) => (
          <ThemeCard
            key={theme.name}
            theme={theme}
            currentTheme={currentTheme}
            isSelected={currentTheme.name === theme.name}
            onSelect={setTheme}
            variant='simple'
          />
        ))}
      </div>
    </div>
  );
}
