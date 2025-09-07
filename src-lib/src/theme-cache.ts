import dark from './dark.json';
import light from './light.json';
import { validateTheme } from './theme-schema-validation';
import { Theme } from './theme.type';
import { deepMerge } from './utils';

const themesCache: Map<string, Theme> = new Map<string, Theme>();

export function getThemesCache(): Theme[] | null {
  return Array.from(themesCache.values());
}

export function invalidateThemesCache(): void {
  themesCache.clear();
}

export async function getThemeByName(name: string): Promise<Theme | undefined> {
  return themesCache.get(name);
}

export async function loadThemes(themeData: string[]): Promise<Theme[]> {
  if (themesCache.size !== 0) {
    return Array.from(themesCache.values());
  }

  themesCache.set('dark', dark as Theme);
  themesCache.set('light', light as Theme);

  for (const json of themeData) {
    const theme = await loadTheme(json);
    if (theme) {
      themesCache.set(theme.name, theme);
    }
  }
  return Array.from(themesCache.values());
}

export async function loadTheme(themeJson: string): Promise<Theme | null> {
  try {
    let theme = validateTheme(themeJson);

    if (theme.inherits) {
      const inheritedTheme = themesCache.get(theme.inherits);
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
          // const imageModules = import.meta.glob(
          //     '../themes/*/*.{jpg,jpeg,png,gif,webp}',
          //     { eager: true },
          // );
          // const imagePath = `../themes/${themeName}/${theme.backgroundImage}`;
          // const imageModule = imageModules[imagePath];
          // if (imageModule) {
          //     theme.backgroundImage = (
          //         imageModule as { default: string }
          //     ).default;
          // } else {
          //     // Fallback to a relative path if not found
          //     theme.backgroundImage = `../themes/${themeName}/${theme.backgroundImage}`;
          // }
        }
      } catch (error) {
        console.warn(`Error loading theme ${theme.name}:`, error);
        theme.backgroundImage = undefined;
      }
    }

    theme.isUserTheme = false;

    return theme;
  } catch (error) {
    console.error(`Error loading theme`, error);
    return null;
  }
}
