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
      const workingTheme = this.initializeTheme(
        JSON.parse(JSON.stringify(theme)) as Theme,
        imageResolver,
      );
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

    return this.initializeTheme(theme, imageResolver);
  }

  public initializeTheme(
    theme: Theme,
    imageResolver: ImageResolver | null = null,
  ): Theme {
    try {
      if (theme.inherits) {
        const inheritedTheme = this.themesCache.getThemeSafe(theme.inherits);
        const tags = theme.tags || [];
        theme = deepMerge(inheritedTheme, theme);
        theme.tags = tags;
      }

      if (theme.backgroundImage && imageResolver) {
        try {
          // we allow remote urls and local files for built in themes
          // local images get imported from the theme's folder
          if (urlRequiresResolution(theme.backgroundImage)) {
            theme.backgroundImage = imageResolver(
              theme.name,
              theme.backgroundImage,
            );
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
    return theme;
  }
}

function urlRequiresResolution(url: string | undefined | null): boolean {
  return !!(
    url &&
    !url.startsWith('http://') &&
    !url.startsWith('https://') &&
    !url.startsWith('data:')
  );
}
