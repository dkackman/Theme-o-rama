import { discoverThemes } from '@/lib/themes';
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { applyTheme, Theme, ThemeCache, ThemeLoader } from 'theme-o-rama';
import { useLocalStorage } from 'usehooks-ts';

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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingTheme, setIsSettingTheme] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedTheme, setSavedTheme] = useLocalStorage<string | null>(
    'theme',
    null,
  );
  // this is the pre-themes dark mode setting that we will migrate if needed
  const [dark] = useLocalStorage<boolean>('dark', false);
  const [lastUsedNonCoreTheme, setLastUsedNonCoreTheme] = useLocalStorage<
    string | null
  >('last-used-non-core-theme', null);
  // Use refs for stable instances that don't need to trigger re-renders
  const themeCache = useRef<ThemeCache>(new ThemeCache()).current;
  const themeLoader = useRef<ThemeLoader>(new ThemeLoader(themeCache)).current;

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
    try {
      setIsLoading(true);
      setError(null);

      const themeData = await discoverThemes();
      // Invalidate cache to force fresh load
      themeCache.invalidate();

      const themes = themeLoader.loadThemes(themeData);
      themeCache.setThemes(themes);
      if (themes.length === 0) {
        setCurrentTheme(null);
        return;
      }

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
      try {
        setIsLoading(true);
        setError(null);

        const themeData = await discoverThemes();
        const themes = themeLoader.loadThemes(themeData);
        themeCache.setThemes(themes);

        // If no themes loaded, just use CSS defaults
        if (themes.length === 0) {
          setCurrentTheme(null);
          return;
        }

        // Check for legacy dark setting and migrate if needed
        if (dark && !savedTheme) {
          setSavedTheme('dark');
        }

        // Load saved theme from localStorage or use fallback
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedTheme, dark, setSavedTheme]);

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
