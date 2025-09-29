import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import colorTheme from './color.json';
import darkTheme from './dark.json';
import { applyTheme, Theme } from './index';
import lightTheme from './light.json';
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
  initializeTheme: (theme: Theme) => Promise<Theme>;
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
  const themeLoader = useRef<ThemeLoader>(new ThemeLoader()).current;

  // Local storage state management
  const [savedTheme, setSavedTheme] = useState<string | null>(
    () => localStorage.getItem('theme') || null,
  );
  const [dark] = useState<boolean>(
    () => localStorage.getItem('dark') === 'true',
  );
  const [lastUsedNonCoreTheme, setLastUsedNonCoreTheme] = useState<
    string | null
  >(
    () => localStorage.getItem('theme-o-rama-last-used-non-core-theme') || null,
  );

  const setTheme = async (themeName: string) => {
    if (isSettingTheme) return; // Prevent concurrent calls

    setIsSettingTheme(true);
    try {
      const theme = themeLoader.getTheme(themeName);
      setCurrentTheme(theme);
      applyTheme(theme, document.documentElement);
      setSavedTheme(themeName);
      localStorage.setItem('theme', themeName);
      // Save as last used non-core theme if it's not light or dark
      if (themeName !== 'light' && themeName !== 'dark') {
        setLastUsedNonCoreTheme(themeName);
        localStorage.setItem(
          'theme-o-rama-last-used-non-core-theme',
          themeName,
        );
      }
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error setting theme:', err);
      setError('Failed to set theme');
    } finally {
      setIsSettingTheme(false);
    }
  };

  const setCustomTheme = async (themeJson: string | null): Promise<boolean> => {
    if (isSettingTheme) return false; // Prevent concurrent calls

    setIsSettingTheme(true);
    try {
      if (themeJson) {
        const theme = await themeLoader.loadThemeFromJson(
          themeJson,
          imageResolver,
        );
        if (theme) {
          setCurrentTheme(theme);
          applyTheme(theme, document.documentElement);
          setSavedTheme(theme.name); // Mark as custom theme
          localStorage.setItem('theme', theme.name);
          setError(null); // Clear any previous errors
          return true;
        }
      }
    } catch (err) {
      console.error('Error setting custom theme:', err);
      setError('Failed to load custom theme');
      return false;
    } finally {
      setIsSettingTheme(false);
    }

    setError('Invalid theme JSON');
    return false;
  };

  const reloadThemes = async () => {
    if (!discoverThemes) {
      console.warn('No theme discovery function provided');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      themeLoader.clearCache();
      await loadAndCacheThemes(discoverThemes, imageResolver);

      const theme = themeLoader.getTheme(savedTheme);
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
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        await loadAndCacheThemes(discoverThemes, imageResolver);

        // Check for legacy dark setting and migrate if needed
        if (dark && !savedTheme) {
          setSavedTheme('dark');
          localStorage.setItem('theme', 'dark');
        }

        // Set initial theme after loading
        const initialTheme = themeLoader.getTheme(savedTheme);
        setCurrentTheme(initialTheme);
        applyTheme(initialTheme, document.documentElement);
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
    await themeLoader.loadTheme(lightTheme as Theme);
    await themeLoader.loadTheme(darkTheme as Theme);
    await themeLoader.loadTheme(colorTheme as Theme);
    const appThemes = await discoverThemes();
    await themeLoader.loadThemes(appThemes, imageResolver);
  }

  const initializeTheme = async (theme: Theme): Promise<Theme> => {
    return await themeLoader.initializeTheme(theme, imageResolver);
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme,
        setCustomTheme,
        availableThemes: themeLoader.getThemes(),
        isLoading,
        error,
        lastUsedNonCoreTheme,
        reloadThemes,
        initializeTheme,
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
