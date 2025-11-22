import { ThemeCache } from "./theme-cache.js";
import { validateTheme } from "./theme-schema-validation.js";
import { Theme } from "./theme.type.js";
import { deepMerge } from "./utils.js";

// Theme discovery function type - can be provided by the consuming application
export type ImageResolver = (themeName: string, imagePath: string) => Promise<string>;

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
    await Promise.all(themes.map((theme) => this.loadTheme(theme, imageResolver)));
  }

  public async loadTheme(theme: Theme, imageResolver: ImageResolver | null = null): Promise<void> {
    try {
      // Create a deep copy of the theme to avoid readonly issues
      const workingTheme = await this.initializeTheme(
        JSON.parse(JSON.stringify(theme)) as Theme,
        imageResolver,
      );
      this.themesCache.addTheme(workingTheme);
    } catch (error) {
      // Re-throw circular inheritance errors
      if (error instanceof Error && error.message.includes("Circular inheritance")) {
        throw error;
      }
      if (error instanceof Error && error.message.includes("cannot inherit from itself")) {
        throw error;
      }
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
    visitedThemes: Set<string> = new Set(),
  ): Promise<Theme> {
    try {
      if (theme.inherits) {
        // Check for self-inheritance (theme inherits from itself)
        if (theme.inherits === theme.name) {
          throw new Error(
            `Theme "${theme.name}" cannot inherit from itself. Self-inheritance creates a circular dependency.`,
          );
        }

        // Check for circular inheritance: if inherited theme is already in the chain, we have a cycle
        if (visitedThemes.has(theme.inherits)) {
          // Build the cycle path: visited themes -> current theme -> inherited theme (which closes the cycle)
          const cyclePath = Array.from(visitedThemes);
          cyclePath.push(theme.name);
          cyclePath.push(theme.inherits); // This closes the cycle
          const cycle = cyclePath.join(" -> ");
          throw new Error(
            `Circular inheritance detected: ${cycle}. A theme cannot create a circular dependency chain.`,
          );
        }

        // Add current theme to visited set before resolving inheritance
        visitedThemes.add(theme.name);

        const inheritedTheme = this.themesCache.getThemeSafe(theme.inherits);
        const tags = theme.tags || [];

        // Recursively initialize inherited theme to detect cycles in the chain
        // Pass the same visitedThemes set to track the full inheritance chain
        const initializedParent = await this.initializeTheme(
          inheritedTheme,
          imageResolver,
          visitedThemes,
        );

        theme = deepMerge(initializedParent, theme);
        theme.tags = tags;
      }

      if (theme.backgroundImage && imageResolver) {
        try {
          // we allow remote urls and local files for built in themes
          // local images get imported from the theme's folder
          if (urlRequiresResolution(theme.backgroundImage)) {
            theme.backgroundImage = await imageResolver(theme.name, theme.backgroundImage);
          }
        } catch (error) {
          console.warn(`Error loading background image for theme ${theme.name}:`, error);
          theme.backgroundImage = undefined;
        }
      }
    } catch (error) {
      // Re-throw circular inheritance errors
      if (error instanceof Error && error.message.includes("Circular inheritance")) {
        throw error;
      }
      if (error instanceof Error && error.message.includes("cannot inherit from itself")) {
        throw error;
      }
      console.error(`Error loading theme`, error);
    }
    return theme;
  }
}

function urlRequiresResolution(url: string | undefined | null): boolean {
  return !!(
    url &&
    !url.startsWith("http://") &&
    !url.startsWith("https://") &&
    !url.startsWith("data:")
  );
}
