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
  ): Theme {
    try {
      // Create a deep copy of the theme to avoid readonly issues
      let workingTheme = JSON.parse(JSON.stringify(theme)) as Theme;

      if (workingTheme.inherits) {
        const inheritedTheme = this.themesCache.getTheme(workingTheme.inherits);
        if (inheritedTheme) {
          workingTheme = deepMerge(inheritedTheme, workingTheme);
        } else {
          console.warn(
            `Inherited theme for ${workingTheme.name}:${workingTheme.inherits} not found`,
          );
        }
      }

      if (workingTheme.backgroundImage && imageResolver) {
        try {
          // we allow remote urls and local files for built in themes
          // local images get imported from the theme's folder
          if (
            !(
              workingTheme.backgroundImage.startsWith('http://') ||
              workingTheme.backgroundImage.startsWith('https://')
            ) &&
            !workingTheme.backgroundImage.startsWith('/') &&
            !workingTheme.backgroundImage.startsWith('data:')
          ) {
            const resolvedImage = imageResolver(
              workingTheme.name,
              workingTheme.backgroundImage,
            );
            workingTheme.backgroundImage = resolvedImage;
          }
        } catch (error) {
          console.warn(
            `Error loading background image for theme ${workingTheme.name}:`,
            error,
          );
          workingTheme.backgroundImage = undefined;
        }
      }

      return workingTheme;
    } catch (error) {
      console.error(`Error loading theme`, error);
      return theme;
    }
  }

  public loadThemeFromJson(themeJson: string): Theme | null {
    let theme = validateTheme(themeJson);
    return this.loadTheme(theme);
  }
}
