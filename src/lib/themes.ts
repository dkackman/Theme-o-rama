import { Theme } from 'theme-o-rama';
// Dynamically discover theme folders by scanning the themes directory
export async function discoverThemes(): Promise<Theme[]> {
  try {
    // Use dynamic imports to discover available themes
    const themeModules = import.meta.glob('../themes/*/theme.json', {
      eager: true,
    });

    // Extract theme JSON contents from the module paths
    const themeContents = Object.entries(themeModules)
      .map(([path, module]) => {
        // Path format: "../themes/themeName/theme.json"
        const match = path.match(/\.\.\/themes\/([^/]+)\/theme\.json$/);
        if (match) {
          return module as Theme;
        }
        return null;
      })
      .filter((theme): theme is Theme => theme !== null);

    return themeContents;
  } catch (error) {
    console.warn('Could not discover theme folders:', error);
    return [];
  }
}
