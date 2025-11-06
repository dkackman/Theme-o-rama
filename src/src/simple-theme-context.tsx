"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import colorTheme from "./color.json" with { type: "json" };
import darkTheme from "./dark.json" with { type: "json" };
import { applyTheme, Theme } from "./index.js";
import lightTheme from "./light.json" with { type: "json" };
import { ImageResolver, ThemeLoader } from "./theme-loader.js";

export type SimpleThemeChangeCallback = (theme: Theme) => void;

// Browser detection for SSR compatibility
const isBrowser = typeof window !== "undefined";

interface SimpleThemeContextType {
  currentTheme: Theme | null;
  setTheme: (theme: Theme) => void;
  isLoading: boolean;
  error: string | null;
  initializeTheme: (theme: Theme) => Promise<Theme>;
}

const SimpleThemeContext = createContext<SimpleThemeContextType | undefined>(undefined);

interface SimpleThemeProviderProps {
  children: React.ReactNode;
  imageResolver?: ImageResolver;
  onThemeChange?: SimpleThemeChangeCallback;
}

export function SimpleThemeProvider({
  children,
  imageResolver,
  onThemeChange,
}: SimpleThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingTheme, setIsSettingTheme] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use refs for stable instances that don't need to trigger re-renders
  const themeLoader = useRef<ThemeLoader>(new ThemeLoader()).current;
  const imageResolverRef = useRef(imageResolver);

  // Store callbacks and functions in refs to avoid re-running effects when they change
  const onThemeChangeRef = useRef(onThemeChange);
  useEffect(() => {
    onThemeChangeRef.current = onThemeChange;
    imageResolverRef.current = imageResolver;
  }, [onThemeChange]);

  const setTheme = async (theme: Theme) => {
    if (isSettingTheme) return; // Prevent concurrent calls

    setIsSettingTheme(true);
    try {
      setCurrentTheme(theme);
      if (isBrowser) {
        applyTheme(theme, document.documentElement);
      }

      // Notify app of theme change (app handles storage)
      if (onThemeChangeRef.current) {
        onThemeChangeRef.current(theme);
      }

      setError(null); // Clear any previous errors
    } catch (err) {
      console.error("Error setting theme:", err);
      setError("Failed to set theme");
    } finally {
      setIsSettingTheme(false);
    }
  };

  useEffect(() => {
    const initializeThemes = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Always load built-in themes so the can be inherited from
        await themeLoader.loadTheme(lightTheme as Theme);
        await themeLoader.loadTheme(darkTheme as Theme);
        await themeLoader.loadTheme(colorTheme as Theme);
      } catch (err) {
        console.error("Error loading themes:", err);
        setError("Failed to load themes");
        setCurrentTheme(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeThemes();
  }, []);

  const initializeTheme = async (theme: Theme): Promise<Theme> => {
    return await themeLoader.initializeTheme(theme, imageResolverRef.current);
  };

  return (
    <SimpleThemeContext.Provider
      value={{
        currentTheme,
        setTheme,
        isLoading,
        error,
        initializeTheme,
      }}
    >
      {children}
    </SimpleThemeContext.Provider>
  );
}

export function useSimpleTheme() {
  const context = useContext(SimpleThemeContext);
  if (context === undefined) {
    throw new Error("useSimpleTheme must be used within a SimpleThemeProvider");
  }
  return context;
}
