import { ThemeCache } from './theme-cache';
import { validateTheme } from './theme-schema-validation';
import { Theme } from './theme.type';
import { deepMerge } from './utils';

export class ThemeLoader {
  constructor(private readonly themesCache: ThemeCache) {}

  public loadThemes(themes: Theme[]): Theme[] {
    return themes
      .map((theme) => this.loadTheme(theme))
      .filter((theme) => theme !== null);
  }

  public loadTheme(theme: Theme): Theme | null {
    try {
      if (theme.inherits) {
        const inheritedTheme = this.themesCache.getTheme(theme.inherits);
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

      return theme;
    } catch (error) {
      console.error(`Error loading theme`, error);
      return null;
    }
  }

  public loadThemeFromJson(themeJson: string): Theme | null {
    let theme = validateTheme(themeJson);
    return this.loadTheme(theme);
  }
}
