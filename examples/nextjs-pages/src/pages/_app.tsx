import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useCallback, useState } from "react";
import { SimpleThemeProvider } from "theme-o-rama";
import "theme-o-rama/themes.css";

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
    <SimpleThemeProvider onThemeChange={handleThemeChange} imageResolver={resolveThemeImage}>
      <Component {...pageProps} />
    </SimpleThemeProvider>
  );
}
