import { ThemeCache } from './theme-cache';
import { validateTheme } from './theme-schema-validation';
import { Theme } from './theme.type';
import { deepMerge } from './utils';

// Theme discovery function type - can be provided by the consuming application
export type ImageResolver = (themeName: string, imagePath: string) => string;

export class ThemeLoader {
  constructor(private readonly themesCache: ThemeCache) {}

  public loadThemes(
    themes: Theme[],
    imageResolver: ImageResolver | null = null,
  ): Theme[] {
    return themes
      .map((theme) => this.loadTheme(theme, imageResolver))
      .filter((theme) => theme !== null);
  }

  public loadTheme(
    theme: Theme,
    imageResolver: ImageResolver | null = null,
  ): Theme | null {
    try {
      if (theme.inherits) {
        const inheritedTheme = this.themesCache.getTheme(theme.inherits);
        if (inheritedTheme) {
          theme = deepMerge(inheritedTheme, theme);
        }
      }

      if (theme.backgroundImage && imageResolver) {
        try {
          // we allow remote urls and local files for built in themes
          // local images get imported from the theme's folder
          if (
            !(
              theme.backgroundImage.startsWith('http://') ||
              theme.backgroundImage.startsWith('https://')
            ) &&
            !theme.backgroundImage.startsWith('/') &&
            !theme.backgroundImage.startsWith('data:')
          ) {
            theme.backgroundImage = imageResolver(
              theme.name,
              theme.backgroundImage,
            );
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
