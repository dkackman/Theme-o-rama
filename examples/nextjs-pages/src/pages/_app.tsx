import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useCallback, useState } from "react";
import { Theme, ThemeProvider } from "theme-o-rama";
import "theme-o-rama/themes.css";
import colorfulTheme from "../../public/themes/colorful/theme.json";
import win95Theme from "../../public/themes/win95/theme.json";

// Discover custom themes for this app
async function discoverThemes(): Promise<Theme[]> {
  // Return app-specific themes
  return [colorfulTheme as Theme, win95Theme as Theme];
}

// Image resolver for theme background images
async function resolveThemeImage(themeName: string, imagePath: string): Promise<string> {
  // Images are in /public/themes/{imagePath}
  // Next.js serves public files from root
  return `/themes/${themeName}/${imagePath}`;
}

export default function App({ Component, pageProps }: AppProps) {
  // Read actual theme from localStorage on client
  const [defaultTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    try {
      return localStorage.getItem("theme") || "light";
    } catch {
      return "light";
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
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
