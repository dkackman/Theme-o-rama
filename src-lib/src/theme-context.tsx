'use client';

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

// Browser detection for SSR compatibility
const isBrowser = typeof window !== 'undefined';

// Theme discovery function type - can be provided by the consuming application
export type ThemeDiscoveryFunction = () => Promise<Theme[]>;

// Callback when theme changes - allows app to handle storage
export type ThemeChangeCallback = (themeName: string) => void;

interface ThemeContextType {
  currentTheme: Theme | null;
  setTheme: (themeName: string) => void;
  setCustomTheme: (themeJson: string) => Promise<boolean>;
  availableThemes: Theme[];
  isLoading: boolean;
  error: string | null;
  reloadThemes: () => Promise<void>;
  initializeTheme: (theme: Theme) => Promise<Theme>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  discoverThemes?: ThemeDiscoveryFunction;
  imageResolver?: ImageResolver;
  defaultTheme?: string;
  onThemeChange?: ThemeChangeCallback;
}

export function ThemeProvider({
  children,
  discoverThemes = async (): Promise<Theme[]> => [],
  imageResolver,
  defaultTheme = 'light',
  onThemeChange,
}: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingTheme, setIsSettingTheme] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use refs for stable instances that don't need to trigger re-renders
  const themeLoader = useRef<ThemeLoader>(new ThemeLoader()).current;

  // Store callbacks and functions in refs to avoid re-running effects when they change
  const onThemeChangeRef = useRef(onThemeChange);
  const imageResolverRef = useRef(imageResolver);
  const discoverThemesRef = useRef(discoverThemes);

  useEffect(() => {
    onThemeChangeRef.current = onThemeChange;
    imageResolverRef.current = imageResolver;
    discoverThemesRef.current = discoverThemes;
  }, [onThemeChange, imageResolver, discoverThemes]);

  const setTheme = async (themeName: string) => {
    if (isSettingTheme) return; // Prevent concurrent calls

    setIsSettingTheme(true);
    try {
      const theme = themeLoader.getTheme(themeName);
      setCurrentTheme(theme);
      if (isBrowser) {
        applyTheme(theme, document.documentElement);
      }

      // Notify app of theme change (app handles storage)
      if (onThemeChangeRef.current) {
        onThemeChangeRef.current(themeName);
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
          if (isBrowser) {
            applyTheme(theme, document.documentElement);
          }

          // Notify app of theme change (app handles storage)
          if (onThemeChangeRef.current) {
            onThemeChangeRef.current(theme.name);
          }

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
    try {
      setIsLoading(true);
      setError(null);

      themeLoader.clearCache();

      // Always load built-in themes
      await themeLoader.loadTheme(lightTheme as Theme);
      await themeLoader.loadTheme(darkTheme as Theme);
      await themeLoader.loadTheme(colorTheme as Theme);

      // Load additional themes if discovery function provided
      if (discoverThemesRef.current) {
        const appThemes = await discoverThemesRef.current();
        await themeLoader.loadThemes(appThemes, imageResolverRef.current);
      }

      const theme = themeLoader.getTheme(defaultTheme);
      setCurrentTheme(theme);
      if (isBrowser) {
        applyTheme(theme, document.documentElement);
      }
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

        // Always load built-in themes
        await themeLoader.loadTheme(lightTheme as Theme);
        await themeLoader.loadTheme(darkTheme as Theme);
        await themeLoader.loadTheme(colorTheme as Theme);

        // Load additional themes if discovery function provided
        if (discoverThemesRef.current) {
          const appThemes = await discoverThemesRef.current();
          await themeLoader.loadThemes(appThemes, imageResolverRef.current);
        }

        // Set initial theme after loading (use defaultTheme prop)
        const initialTheme = themeLoader.getTheme(defaultTheme);
        setCurrentTheme(initialTheme);
        if (isBrowser) {
          applyTheme(initialTheme, document.documentElement);
        }
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
    // Only re-run when defaultTheme changes, not when functions change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultTheme]);

  const initializeTheme = async (theme: Theme): Promise<Theme> => {
    return await themeLoader.initializeTheme(theme, imageResolverRef.current);
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
