import { ThemeCache } from './theme-cache';
import { validateTheme } from './theme-schema-validation';
import { Theme } from './theme.type';
import { deepMerge } from './utils';

// Theme discovery function type - can be provided by the consuming application
export type ImageResolver = (
  themeName: string,
  imagePath: string,
) => Promise<string>;

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

  public async loadThemes(
    themes: Theme[],
    imageResolver: ImageResolver | null = null,
  ): Promise<void> {
    await Promise.all(
      themes.map((theme) => this.loadTheme(theme, imageResolver)),
    );
  }

  public async loadTheme(
    theme: Theme,
    imageResolver: ImageResolver | null = null,
  ): Promise<void> {
    try {
      // Create a deep copy of the theme to avoid readonly issues
      const workingTheme = await this.initializeTheme(
        JSON.parse(JSON.stringify(theme)) as Theme,
        imageResolver,
      );
      this.themesCache.addTheme(workingTheme);
    } catch (error) {
      console.error(`Error loading theme`, error);
    }
  }

  public async loadThemeFromJson(
    themeJson: string,
    imageResolver: ImageResolver | null = null,
  ): Promise<Theme> {
    const theme = validateTheme(themeJson);

    const initializeTheme = await this.initializeTheme(theme, imageResolver);
    this.themesCache.addTheme(initializeTheme);
    return initializeTheme;
  }

  public async initializeTheme(
    theme: Theme,
    imageResolver: ImageResolver | null = null,
  ): Promise<Theme> {
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
            theme.backgroundImage = await imageResolver(
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
