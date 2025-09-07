import iconDark from '@/icon-dark.png';
import iconLight from '@/icon-light.png';
import { Theme } from 'theme-o-rama';
import { validateTheme } from './theme-schema-validation';
import { deepMerge } from './utils';

export async function loadUserTheme(themeJson: string): Promise<Theme | null> {
  try {
    let theme = validateTheme(JSON.parse(themeJson));

    if (theme.inherits) {
      const inheritedTheme = await loadBuiltInTheme(
        theme.inherits,
        new Map<string, Theme>(),
        new Set<string>(),
      );
      if (inheritedTheme) {
        theme = deepMerge(inheritedTheme, theme);
      }
    }

    // user themes cannot override these settings
    theme.isFeatured = false;
    theme.isUserTheme = true;
    return theme;
  } catch (error) {
    console.error(`Error loading user theme:`, error);
    return null;
  }
}

export async function loadBuiltInTheme(
  themeName: string,
  themes: Map<string, Theme>,
  loadedThemes: Set<string> = new Set<string>(),
): Promise<Theme | null> {
  try {
    // Check for circular inheritance
    if (loadedThemes.has(themeName)) {
      console.warn(
        `Circular theme inheritance detected: ${Array.from(loadedThemes).join(' -> ')} -> ${themeName}. Skipping inheritance.`,
      );
      return null;
    }

    loadedThemes.add(themeName);

    // Import theme as a module for hot reloading
    const themeModule = await import(`../themes/${themeName}/theme.json`);

    let theme = themeModule.default as Theme;

    if (theme.inherits) {
      const inheritedTheme = themes.get(theme.inherits);
      if (inheritedTheme) {
        theme = deepMerge(inheritedTheme, theme);
      }
    }

    if (theme.backgroundImage) {
      try {
        // we allow remote urls and local files for built in themes
        // local images get imported from the theme's folder
        if (
          !(
            theme.backgroundImage.startsWith('http://') ||
            theme.backgroundImage.startsWith('https://')
          ) &&
          !theme.backgroundImage.startsWith('/')
        ) {
          // Use static glob import to avoid dynamic import warnings for local files
          const imageModules = import.meta.glob(
            '../themes/*/*.{jpg,jpeg,png,gif,webp}',
            { eager: true },
          );
          const imagePath = `../themes/${themeName}/${theme.backgroundImage}`;
          const imageModule = imageModules[imagePath];

          if (imageModule) {
            theme.backgroundImage = (
              imageModule as { default: string }
            ).default;
          } else {
            // Fallback to a relative path if not found
            theme.backgroundImage = `../themes/${themeName}/${theme.backgroundImage}`;
          }
        }
      } catch (error) {
        console.warn(`Error loading theme ${themeName}:`, error);
        theme.backgroundImage = undefined;
      }
    }

    // only light and dark icons for now
    theme.icon_path = theme.most_like === 'dark' ? iconLight : iconDark;
    theme.isUserTheme = false;

    return theme;
  } catch (error) {
    console.error(`Error loading theme ${themeName}:`, error);
    return null;
  }
}
