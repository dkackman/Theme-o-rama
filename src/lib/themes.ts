import { dark, light, Theme } from 'theme-o-rama';
import { loadBuiltInTheme } from './theme';

let themesCache: Theme[] | null = null;

// Dynamically discover theme folders by scanning the themes directory
async function discoverThemeFolders(): Promise<string[]> {
  try {
    // Use dynamic imports to discover available themes
    const themeModules = import.meta.glob('../themes/*/theme.json', {
      eager: false,
    });

    // Extract theme names from the module paths
    const themeNames = Object.keys(themeModules)
      .map((path) => {
        // Path format: "../themes/themeName/theme.json"
        const match = path.match(/\.\.\/themes\/([^/]+)\/theme\.json$/);
        return match ? match[1] : null;
      })
      .filter((name): name is string => name !== null);

    return themeNames;
  } catch (error) {
    console.warn('Could not discover theme folders:', error);
    return [];
  }
}

export async function loadThemes(): Promise<Theme[]> {
  // Return cached themes if available
  if (themesCache !== null) {
    return themesCache;
  }

  const themeFolders = await discoverThemeFolders();
  const themes = new Map<string, Theme>();
  themes.set('dark', dark);
  themes.set('light', light);

  for (const themeName of themeFolders) {
    const theme = await loadBuiltInTheme(themeName, themes);
    if (theme) {
      themes.set(themeName, theme);
    }
  }

  themesCache = Array.from(themes.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  return themesCache;
}

export async function getThemeByName(name: string): Promise<Theme | undefined> {
  const themes = await loadThemes();
  return themes.find((theme) => theme.name === name);
}

export function invalidateThemeCache(): void {
  themesCache = null;
}
