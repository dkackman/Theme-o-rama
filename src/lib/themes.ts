import { Theme, validateTheme } from 'theme-o-rama';

export function validateThemeJson(json: string): void {
  const theme = validateTheme(json);
  if (theme?.buttonStyles) {
    theme.buttonStyles.forEach((buttonStyle: string) => {
      if (
        buttonStyle !== 'gradient' &&
        buttonStyle !== 'shimmer' &&
        buttonStyle !== 'pixel-art' &&
        buttonStyle !== '3d-effects' &&
        buttonStyle !== 'rounded-buttons'
      ) {
        throw new Error(`Invalid button style: ${buttonStyle}`);
      }
    });
  }
}

// HMR-friendly theme discovery - imports are handled at the app level
// to ensure Vite can track dependencies properly
export function createDiscoverThemes(themeModules: Record<string, unknown>) {
  return async function discoverThemes(): Promise<Theme[]> {
    try {
      // Extract theme JSON contents from the module paths
      const themeContents = Object.entries(themeModules)
        .map(([path, module]) => {
          // Path format: "./themes/themeName/theme.json" (note the single dot)
          const match = path.match(/\.\/themes\/([^/]+)\/theme\.json$/);
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
  };
}

export function resolveThemeImage(
  themeName: string,
  imagePath: string,
): string {
  // Check for sentinel value to return uploaded background image
  if (imagePath === '{NEED_DATA_URL_BACKGROUND_IMAGE}') {
    return localStorage.getItem('background-image') ?? '';
  }

  // Use static glob import to avoid dynamic import warnings for local files
  const imageModules = import.meta.glob(
    '../themes/*/*.{jpg,jpeg,png,gif,webp}',
    { eager: true },
  );
  const resolvedPath = `../themes/${themeName}/${imagePath}`;
  const imageModule = imageModules[resolvedPath];

  if (imageModule) {
    return (imageModule as { default: string }).default;
  }

  return `../themes/${themeName}/${imagePath}`;
}
