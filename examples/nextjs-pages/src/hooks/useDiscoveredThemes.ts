import { useEffect, useState } from "react";
import { dark, light, Theme, useSimpleTheme } from "theme-o-rama";
import { useLastActiveTheme } from "./useLastActiveTheme";

// List of theme directories in public/themes
// These should match the folder names in public/themes/
const THEME_DIRECTORIES = [
  "circuit",
  "colorful",
  "glass-dark",
  "glass-light",
  "win95",
  "xch-dark",
  "xch-light",
];

/**
 * Hook that discovers and loads themes from public/themes folder
 * Also restores the last active theme after themes are discovered
 */
export function useDiscoveredThemes() {
  const { initializeTheme, setTheme } = useSimpleTheme();
  const { getLastActiveTheme } = useLastActiveTheme();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasRestoredTheme, setHasRestoredTheme] = useState(false);

  useEffect(() => {
    const loadThemes = async () => {
      setIsLoading(true);
      setError(null);
      const loadedThemes: Theme[] = [];

      for (const themeDir of THEME_DIRECTORIES) {
        try {
          // Fetch theme.json from public folder
          // Next.js serves files from public at the root, so /themes/... is correct
          const response = await fetch(`/themes/${themeDir}/theme.json`);
          if (!response.ok) {
            console.warn(`Failed to fetch theme from ${themeDir}: ${response.statusText}`);
            continue;
          }

          const themeData = (await response.json()) as Theme;

          const initializedTheme = await initializeTheme(themeData);
          loadedThemes.push(initializedTheme);
        } catch (err) {
          console.error(`Error loading theme from ${themeDir}:`, err);
        }
      }

      setThemes(loadedThemes);
      setIsLoading(false);
    };

    loadThemes();
  }, [initializeTheme]);

  // Restore last active theme after themes are loaded
  useEffect(() => {
    if (!isLoading && !hasRestoredTheme) {
      const lastActiveThemeName = getLastActiveTheme();

      if (lastActiveThemeName) {
        // Check if it's a default theme (light or dark)
        if (lastActiveThemeName === light.name || lastActiveThemeName === dark.name) {
          const defaultTheme = lastActiveThemeName === light.name ? light : dark;
          setTheme(defaultTheme);
          setHasRestoredTheme(true);
          return;
        }

        // Check discovered themes (only if we have themes loaded)
        if (themes.length > 0) {
          const foundTheme = themes.find((theme) => theme.name === lastActiveThemeName);
          if (foundTheme) {
            setTheme(foundTheme);
            setHasRestoredTheme(true);
            return;
          }
        }

        // Theme not found in discovered themes
        console.warn(`Last active theme "${lastActiveThemeName}" not found, using current default`);
      }

      setHasRestoredTheme(true);
    }
  }, [isLoading, themes, hasRestoredTheme, getLastActiveTheme, setTheme]);

  return { themes, isLoading, error };
}
