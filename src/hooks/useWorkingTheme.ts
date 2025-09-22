import { areColorsEqual, hslToRgb, rgbToHsl } from '@/lib/utils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Theme } from 'theme-o-rama';
import { useLocalStorage } from 'usehooks-ts';

const WORKING_THEME_KEY = 'theme-o-rama-working-theme';

export function useWorkingTheme() {
  const [workingThemeJson, setWorkingThemeJson] = useLocalStorage<
    string | null
  >(WORKING_THEME_KEY, null);

  // Theme editor state
  const [selectedColor, setSelectedColor] = useLocalStorage<{
    r: number;
    g: number;
    b: number;
  }>('theme-o-rama-design-selected-color', {
    r: 27,
    g: 30,
    b: 51,
  });

  const [colorPickerColor, setColorPickerColor] = useState<{
    r: number;
    g: number;
    b: number;
  }>(selectedColor);

  const [backgroundImage, setBackgroundImage] = useLocalStorage<string | null>(
    'background-image',
    null,
  );

  const [themeName, setThemeName] = useLocalStorage<string>(
    'theme-o-rama-design-theme-name',
    '',
  );

  const [backdropFilters, setBackdropFilters] = useLocalStorage<boolean>(
    'theme-o-rama-backdrop-filters',
    true,
  );

  // Ref to prevent feedback loop when updating from working theme
  const isUpdatingFromWorkingTheme = useRef(false);

  const workingTheme = useMemo(() => {
    if (!workingThemeJson) return null;
    try {
      return JSON.parse(workingThemeJson) as Theme;
    } catch (error) {
      console.error('Error parsing working theme JSON:', error);
      return null;
    }
  }, [workingThemeJson]);

  // Generate theme JSON from selected color and optional background image
  const generateThemeFromColor = useCallback(
    (
      color: {
        r: number;
        g: number;
        b: number;
      },
      backgroundImageUrl?: string | null,
      name?: string,
      backdropFilters?: boolean,
    ) => {
      const hsl = rgbToHsl(color.r, color.g, color.b);
      const themeName = name || 'design';
      const theme = {
        name: themeName,
        displayName: themeName,
        mostLike: (hsl.l > 50 ? 'light' : 'dark') as 'light' | 'dark',
        inherits: 'color',
        schemaVersion: 1 as const,
        backgroundImage: backgroundImageUrl
          ? '{NEED_DATA_URL_BACKGROUND_IMAGE}'
          : undefined,
        colors: {
          themeColor: `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%)`,
          background: backgroundImageUrl ? 'transparent' : `var(--theme-color)`,
          ...(backdropFilters === false && {
            cardBackdropFilter: null,
            popoverBackdropFilter: null,
            inputBackdropFilter: null,
          }),
        },
        ...(backdropFilters === false && {
          sidebar: {
            backdropFilter: null,
          },
          tables: {
            header: {
              backdropFilter: null,
            },
          },
          row: {
            backdropFilter: null,
          },
          footer: {
            backdropFilter: null,
          },
          buttons: {
            default: {
              backdropFilter: null,
            },
            outline: {
              backdropFilter: null,
            },
            secondary: {
              backdropFilter: null,
            },
            destructive: {
              backdropFilter: null,
            },
            ghost: {
              backdropFilter: null,
            },
            link: {
              backdropFilter: null,
            },
          },
        }),
      };
      return theme;
    },
    [],
  );

  // Memoize the generated theme to prevent unnecessary re-renders
  const generatedTheme = useMemo(() => {
    return generateThemeFromColor(
      selectedColor,
      backgroundImage,
      themeName,
      backdropFilters,
    );
  }, [
    selectedColor,
    backgroundImage,
    themeName,
    generateThemeFromColor,
    backdropFilters,
  ]);

  const updateWorkingTheme = useCallback(
    (theme: Theme | null) => {
      if (theme) {
        setWorkingThemeJson(JSON.stringify(theme, null, 2));
      } else {
        setWorkingThemeJson(null);
      }
    },
    [setWorkingThemeJson],
  );

  const updateWorkingThemeFromJson = useCallback(
    (json: string | null) => {
      setWorkingThemeJson(json);
    },
    [setWorkingThemeJson],
  );

  const clearWorkingTheme = useCallback(() => {
    setWorkingThemeJson(null);
  }, [setWorkingThemeJson]);

  // Handler to sync color picker with selected color and update working theme
  const handleColorPickerChange = useCallback(
    (newColor: { r: number; g: number; b: number }) => {
      setColorPickerColor(newColor);
      setSelectedColor(newColor);
    },
    [setSelectedColor],
  );

  // Load working theme data when component mounts
  useEffect(() => {
    if (workingTheme && !isUpdatingFromWorkingTheme.current) {
      isUpdatingFromWorkingTheme.current = true;

      // Extract data from working theme to populate form fields
      if (workingTheme.colors?.themeColor) {
        const newColor = hslToRgb(workingTheme.colors.themeColor);
        if (newColor && !areColorsEqual(newColor, selectedColor)) {
          setSelectedColor(newColor);
          setColorPickerColor(newColor);
        }
      }

      if (workingTheme.displayName) {
        setThemeName(workingTheme.displayName);
      }

      // Reset the flag after a short delay to allow for the update cycle to complete
      setTimeout(() => {
        isUpdatingFromWorkingTheme.current = false;
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workingTheme, setSelectedColor, setThemeName]);

  // Update working theme only when user explicitly changes color, background image, or theme name
  // This prevents circular updates that cause jittery behavior
  // Note: We intentionally don't include generatedTheme in deps to prevent circular updates
  useEffect(() => {
    if (!isUpdatingFromWorkingTheme.current) {
      updateWorkingTheme(generatedTheme);
    }
  }, [
    selectedColor,
    backgroundImage,
    themeName,
    updateWorkingTheme,
    backdropFilters,
    generatedTheme,
  ]);

  const hasWorkingTheme = workingTheme !== null;

  return {
    // Core working theme state
    workingTheme,
    workingThemeJson,
    updateWorkingTheme,
    updateWorkingThemeFromJson,
    clearWorkingTheme,
    hasWorkingTheme,

    // Theme editor state
    selectedColor,
    setSelectedColor,
    colorPickerColor,
    setColorPickerColor,
    backgroundImage,
    setBackgroundImage,
    themeName,
    setThemeName,
    backdropFilters,
    setBackdropFilters,

    // Theme generation and handlers
    generateThemeFromColor,
    generatedTheme,
    handleColorPickerChange,
  };
}
