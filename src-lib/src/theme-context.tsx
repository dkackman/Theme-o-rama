import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useLocalStorage } from 'usehooks-ts';
import darkTheme from './dark.json';
import { applyTheme, Theme } from './index';
import lightTheme from './light.json';
import { ThemeCache } from './theme-cache';
import { ImageResolver, ThemeLoader } from './theme-loader';

// Theme discovery function type - can be provided by the consuming application
export type ThemeDiscoveryFunction = () => Promise<Theme[]>;

interface ThemeContextType {
  currentTheme: Theme | null;
  setTheme: (themeName: string) => void;
  setCustomTheme: (themeJson: string) => Promise<boolean>;
  availableThemes: Theme[];
  isLoading: boolean;
  error: string | null;
  lastUsedNonCoreTheme: string | null;
  reloadThemes: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  discoverThemes?: ThemeDiscoveryFunction;
  imageResolver?: ImageResolver;
}

export function ThemeProvider({
  children,
  discoverThemes,
  imageResolver,
}: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingTheme, setIsSettingTheme] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use refs for stable instances that don't need to trigger re-renders
  const themeCache = useRef<ThemeCache>(new ThemeCache()).current;
  const themeLoader = useRef<ThemeLoader>(new ThemeLoader(themeCache)).current;
  const [savedTheme, setSavedTheme] = useLocalStorage<string | null>(
    'theme',
    null,
  );
  // this is the pre-themes dark mode setting that we will migrate if needed
  const [dark] = useLocalStorage<boolean>('dark', false);
  const [lastUsedNonCoreTheme, setLastUsedNonCoreTheme] = useLocalStorage<
    string | null
  >('theme-o-rama-last-used-non-core-theme', null);

  const setTheme = async (themeName: string) => {
    if (isSettingTheme) return; // Prevent concurrent calls

    setIsSettingTheme(true);
    try {
      const theme = themeCache.getTheme(themeName);
      if (theme) {
        setCurrentTheme(theme);
        applyTheme(theme, document.documentElement);
        setSavedTheme(themeName);
        // Save as last used non-core theme if it's not light or dark
        if (themeName !== 'light' && themeName !== 'dark') {
          setLastUsedNonCoreTheme(themeName);
        }
        setError(null); // Clear any previous errors
      } else {
        setError(`Theme "${themeName}" not found`);
      }
    } catch (err) {
      console.error('Error setting theme:', err);
      setError('Failed to set theme');
    } finally {
      setIsSettingTheme(false);
    }
  };

  const setCustomTheme = async (themeJson: string): Promise<boolean> => {
    if (isSettingTheme) return false; // Prevent concurrent calls

    setIsSettingTheme(true);
    try {
      const theme = themeLoader.loadThemeFromJson(themeJson);
      if (theme) {
        // Store the custom theme in the cache so it persists
        themeCache.addTheme(theme);
        setCurrentTheme(theme);
        applyTheme(theme, document.documentElement);
        setSavedTheme('custom'); // Mark as custom theme
        setError(null); // Clear any previous errors
        return true;
      } else {
        setError('Invalid theme JSON');
        return false;
      }
    } catch (err) {
      console.error('Error setting custom theme:', err);
      setError('Failed to load custom theme');
      return false;
    } finally {
      setIsSettingTheme(false);
    }
  };

  const reloadThemes = async () => {
    if (!discoverThemes) {
      console.warn('No theme discovery function provided');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      themeCache.invalidate();
      await loadAndCacheThemes(discoverThemes, imageResolver);

      const theme = themeCache.getThemeSafe(savedTheme);
      setCurrentTheme(theme);
      applyTheme(theme, document.documentElement);
    } catch (err) {
      console.error('Error reloading themes:', err);
      setError('Failed to reload themes');
      setCurrentTheme(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeThemes = async () => {
      if (!discoverThemes) {
        // If no discovery function provided, just use the default themes from cache
        setIsLoading(false);
        const theme = themeCache.getThemeSafe(savedTheme);
        setCurrentTheme(theme);
        applyTheme(theme, document.documentElement);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        await loadAndCacheThemes(discoverThemes, imageResolver);

        // Check for legacy dark setting and migrate if needed
        if (dark && !savedTheme) {
          setSavedTheme('dark');
        }

        const theme = themeCache.getThemeSafe(savedTheme);
        setCurrentTheme(theme);
        applyTheme(theme, document.documentElement);
      } catch (err) {
        console.error('Error loading themes:', err);
        setError('Failed to load themes');
        // Don't set a fallback theme - let CSS defaults handle it
        setCurrentTheme(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeThemes();
  }, [savedTheme, dark, setSavedTheme]);

  async function loadAndCacheThemes(
    discoverThemes: ThemeDiscoveryFunction,
    imageResolver: ImageResolver | null = null,
  ) {
    themeCache.addTheme(themeLoader.loadTheme(lightTheme as Theme));
    themeCache.addTheme(themeLoader.loadTheme(darkTheme as Theme));
    const appThemes = await discoverThemes();
    const themes = themeLoader.loadThemes(appThemes, imageResolver);
    themeCache.addThemes(themes);
  }

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme,
        setCustomTheme,
        availableThemes: themeCache.getThemes(),
        isLoading,
        error,
        lastUsedNonCoreTheme,
        reloadThemes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
