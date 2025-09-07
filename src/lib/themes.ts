// Dynamically discover theme folders by scanning the themes directory
export async function discoverThemes(): Promise<string[]> {
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
          const themeData = (module as any).default;
          return JSON.stringify(themeData);
        }
        return null;
      })
      .filter((theme): theme is any => theme !== null);

    return themeContents;
  } catch (error) {
    console.warn('Could not discover theme folders:', error);
    return [];
  }
}
