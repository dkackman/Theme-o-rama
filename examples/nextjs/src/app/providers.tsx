"use client";

import { useCallback, useState } from "react";
import { Theme, ThemeProvider } from "theme-o-rama";
import colorfulTheme from "../themes/colorful.json";

interface ProvidersProps {
  children: React.ReactNode;
  initialTheme: string;
}

// Discover custom themes for this app
async function discoverThemes(): Promise<Theme[]> {
  // Return app-specific themes
  return [colorfulTheme as Theme];
}

// Image resolver for theme background images
async function resolveThemeImage(themeName: string, imagePath: string): Promise<string> {
  // Images are in /public/themes/{imagePath}
  // Next.js serves public files from root
  return `/themes/${themeName}/${imagePath}`;
}

export function Providers({ children, initialTheme }: ProvidersProps) {
  // Read actual theme from localStorage on client
  const [defaultTheme] = useState(() => {
    if (typeof window === "undefined") return initialTheme;
    try {
      return localStorage.getItem("theme") || initialTheme;
    } catch {
      return initialTheme;
    }
  });

  // Handle theme changes - save to localStorage
  const handleThemeChange = useCallback((themeName: string) => {
    try {
      localStorage.setItem("theme", themeName);
      console.log("Theme saved:", themeName);
    } catch (error) {
      console.warn("Failed to save theme preference:", error);
    }
  }, []);

  return (
    <ThemeProvider
      defaultTheme={defaultTheme}
      onThemeChange={handleThemeChange}
      discoverThemes={discoverThemes}
      imageResolver={resolveThemeImage}
    >
      {children}
    </ThemeProvider>
  );
}
