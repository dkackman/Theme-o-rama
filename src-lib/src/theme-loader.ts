import { ThemeCache } from './theme-cache';
import { validateTheme } from './theme-schema-validation';
import { Theme } from './theme.type';
import { deepMerge } from './utils';

// Theme discovery function type - can be provided by the consuming application
export type ImageResolver = (themeName: string, imagePath: string) => string;

export class ThemeLoader {
  private readonly themesCache: ThemeCache;
  constructor() {
    this.themesCache = new ThemeCache();
  }

  public clearCache() {
    this.themesCache.invalidate();
  }

  public getTheme(themeName: string | null): Theme {
    return this.themesCache.getThemeSafe(themeName);
  }

  public getThemes(): Theme[] {
    return this.themesCache.getThemes();
  }

  public loadThemes(
    themes: Theme[],
    imageResolver: ImageResolver | null = null,
  ): void {
    themes.forEach((theme) => this.loadTheme(theme, imageResolver));
  }

  public loadTheme(
    theme: Theme,
    imageResolver: ImageResolver | null = null,
  ): void {
    try {
      // Create a deep copy of the theme to avoid readonly issues
      let workingTheme = JSON.parse(JSON.stringify(theme)) as Theme;
      this.initializeTheme(workingTheme, imageResolver);
      this.themesCache.addTheme(workingTheme);
    } catch (error) {
      console.error(`Error loading theme`, error);
    }
  }

  public loadThemeFromJson(
    themeJson: string,
    imageResolver: ImageResolver | null = null,
  ): Theme {
    const theme = validateTheme(themeJson);
    this.initializeTheme(theme, imageResolver);
    return theme;
  }

  private initializeTheme(
    theme: Theme,
    imageResolver: ImageResolver | null = null,
  ): void {
    try {
      if (theme.inherits) {
        const inheritedTheme = this.themesCache.getTheme(theme.inherits);
        if (inheritedTheme) {
          theme = deepMerge(inheritedTheme, theme);
        } else {
          console.warn(
            `Inherited theme for ${theme.name}:${theme.inherits} not found`,
          );
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
            const resolvedImage = imageResolver(
              theme.name,
              theme.backgroundImage,
            );
            theme.backgroundImage = resolvedImage;
          }
        } catch (error) {
          console.warn(
            `Error loading background image for theme ${theme.name}:`,
            error,
          );
          theme.backgroundImage = undefined;
        }
      }
    } catch (error) {
      console.error(`Error loading theme`, error);
    }
  }
}
