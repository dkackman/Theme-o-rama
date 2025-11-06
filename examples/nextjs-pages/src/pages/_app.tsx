import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useCallback } from "react";
import { SimpleThemeProvider, Theme } from "theme-o-rama";
import "theme-o-rama/themes.css";

// Image resolver for theme background images
async function resolveThemeImage(themeName: string, imagePath: string): Promise<string> {
  // Images are in /public/themes/{imagePath}
  // Next.js serves public files from root
  return `/themes/${themeName}/${imagePath}`;
}

export default function App({ Component, pageProps }: AppProps) {
  // Handle theme changes - save to localStorage
  const handleThemeChange = useCallback((theme: Theme) => {
    try {
      localStorage.setItem("theme", theme.name);
    } catch (error) {
      console.warn("Failed to save theme preference:", error);
    }
  }, []);

  return (
    <SimpleThemeProvider onThemeChange={handleThemeChange} imageResolver={resolveThemeImage}>
      <Component {...pageProps} />
    </SimpleThemeProvider>
  );
}
