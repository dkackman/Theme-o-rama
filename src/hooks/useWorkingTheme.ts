import { STORAGE_KEYS } from '@/lib/constants';
import { areColorsEqual, hslToRgb, rgbToHsl } from '@/lib/utils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Theme, useTheme } from 'theme-o-rama';
import { useLocalStorage } from 'usehooks-ts';

export function useWorkingTheme() {
  const { setCustomTheme } = useTheme();
  const [workingThemeJson, setWorkingThemeJson] = useLocalStorage<
    string | null
  >(STORAGE_KEYS.WORKING_THEME, null);

  // Theme editor state
  const [selectedColor, setSelectedColor] = useLocalStorage<{
    r: number;
    g: number;
    b: number;
  }>(STORAGE_KEYS.SELECTED_COLOR, {
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
    STORAGE_KEYS.BACKGROUND_IMAGE,
    null,
  );

  const [themeName, setThemeName] = useLocalStorage<string>(
    STORAGE_KEYS.THEME_NAME,
    '',
  );

  const [backdropFilters, setBackdropFilters] = useLocalStorage<boolean>(
    STORAGE_KEYS.BACKDROP_FILTERS,
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
      // Sanitize the theme name for use as an identifier (no spaces, special chars)
      const sanitizedName = themeName
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      const theme = {
        name: sanitizedName || 'design',
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
    setThemeName('New Theme');
    setSelectedColor({ r: 220, g: 220, b: 220 }); // Light gray default
    setColorPickerColor({ r: 220, g: 220, b: 220 });
    setBackgroundImage(null);
    setBackdropFilters(true);
  }, [
    setWorkingThemeJson,
    setThemeName,
    setSelectedColor,
    setColorPickerColor,
    setBackgroundImage,
    setBackdropFilters,
  ]);

  // Handler to sync color picker with selected color and update working theme
  const handleColorPickerChange = useCallback(
    (newColor: { r: number; g: number; b: number }) => {
      setColorPickerColor(newColor);
      setSelectedColor(newColor);

      // Auto-apply the theme when color changes
      if (workingThemeJson) {
        const updatedTheme = generateThemeFromColor(
          newColor,
          backgroundImage,
          themeName,
          backdropFilters,
        );
        const updatedThemeJson = JSON.stringify(updatedTheme, null, 2);
        // Set the flag to prevent the working theme update effect from running
        isUpdatingFromWorkingTheme.current = true;
        setCustomTheme(updatedThemeJson);
        // Reset the flag after a short delay
        setTimeout(() => {
          isUpdatingFromWorkingTheme.current = false;
        }, 0);
      }
    },
    [
      setSelectedColor,
      workingThemeJson,
      generateThemeFromColor,
      backgroundImage,
      themeName,
      backdropFilters,
      setCustomTheme,
    ],
  );

  // Handler for backdrop filter changes that automatically applies the theme
  const handleBackdropFiltersChange = useCallback(
    (enabled: boolean) => {
      setBackdropFilters(enabled);

      // Auto-apply the theme when backdrop filter setting changes
      if (workingThemeJson) {
        const updatedTheme = generateThemeFromColor(
          selectedColor,
          backgroundImage,
          themeName,
          enabled,
        );
        const updatedThemeJson = JSON.stringify(updatedTheme, null, 2);
        // Set the flag to prevent the working theme update effect from running
        isUpdatingFromWorkingTheme.current = true;
        setCustomTheme(updatedThemeJson);
        // Reset the flag after a short delay
        setTimeout(() => {
          isUpdatingFromWorkingTheme.current = false;
        }, 0);
      }
    },
    [
      setBackdropFilters,
      workingThemeJson,
      generateThemeFromColor,
      selectedColor,
      backgroundImage,
      themeName,
      setCustomTheme,
    ],
  );

  // Handler for background image changes that automatically applies the theme
  const handleBackgroundImageChange = useCallback(
    (imageUrl: string | null) => {
      setBackgroundImage(imageUrl);

      // Auto-apply the theme when background image changes
      if (workingThemeJson) {
        const updatedTheme = generateThemeFromColor(
          selectedColor,
          imageUrl,
          themeName,
          backdropFilters,
        );
        const updatedThemeJson = JSON.stringify(updatedTheme, null, 2);
        // Set the flag to prevent the working theme update effect from running
        isUpdatingFromWorkingTheme.current = true;
        setCustomTheme(updatedThemeJson);
        // Reset the flag after a short delay
        setTimeout(() => {
          isUpdatingFromWorkingTheme.current = false;
        }, 0);
      }
    },
    [
      setBackgroundImage,
      workingThemeJson,
      generateThemeFromColor,
      selectedColor,
      themeName,
      backdropFilters,
      setCustomTheme,
    ],
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
    handleBackdropFiltersChange,
    handleBackgroundImageChange,
  };
}
