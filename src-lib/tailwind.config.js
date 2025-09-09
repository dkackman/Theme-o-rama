import * as defaultTheme from 'tailwindcss/defaultTheme';

/**
 * Theme-o-rama Tailwind Configuration
 *
 * This configuration provides theme-specific Tailwind extensions that work
 * with the Theme-o-rama dynamic theming system. It includes:
 * - CSS variable-based font families
 * - CSS variable-based border radius
 * - CSS variable-based box shadows
 * - CSS variable-based color system
 *
 * Usage in your app's tailwind.config.js:
 * ```js
 * import { themeExtensions } from 'theme-o-rama/tailwind.config.js';
 *
 * export default {
 *   // ... your app config
 *   theme: {
 *     extend: {
 *       ...themeExtensions,
 *       // ... your app-specific extensions
 *     }
 *   }
 * }
 * ```
 */

export const themeExtensions = {
  fontFamily: {
    sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
    serif: ['var(--font-serif)', ...defaultTheme.fontFamily.serif],
    mono: ['var(--font-mono)', ...defaultTheme.fontFamily.mono],
    heading: ['var(--font-heading)', ...defaultTheme.fontFamily.sans],
    body: ['var(--font-body)', ...defaultTheme.fontFamily.sans],
  },

  borderRadius: {
    none: 'var(--corner-none)',
    sm: 'var(--corner-sm)',
    md: 'var(--corner-md)',
    lg: 'var(--corner-lg)',
    xl: 'var(--corner-xl)',
    full: 'var(--corner-full)',
  },

  boxShadow: {
    none: 'var(--shadow-none)',
    sm: 'var(--shadow-sm)',
    DEFAULT: 'var(--shadow-md)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    xl: 'var(--shadow-xl)',
    inner: 'var(--shadow-inner)',
    card: 'var(--shadow-card)',
    button: 'var(--shadow-button)',
  },

  colors: {
    background: 'var(--background)',
    foreground: 'var(--foreground)',
    card: {
      DEFAULT: 'var(--card)',
      foreground: 'var(--card-foreground)',
    },
    popover: {
      DEFAULT: 'var(--popover)',
      foreground: 'var(--popover-foreground)',
    },
    primary: {
      DEFAULT: 'var(--primary)',
      foreground: 'var(--primary-foreground)',
    },
    secondary: {
      DEFAULT: 'var(--secondary)',
      foreground: 'var(--secondary-foreground)',
    },
    muted: {
      DEFAULT: 'var(--muted)',
      foreground: 'var(--muted-foreground)',
    },
    accent: {
      DEFAULT: 'var(--accent)',
      foreground: 'var(--accent-foreground)',
    },
    destructive: {
      DEFAULT: 'var(--destructive)',
      foreground: 'var(--destructive-foreground)',
    },
    border: 'var(--border)',
    input: 'var(--input)',
    'input-background': 'var(--input-background)',
    ring: 'var(--ring)',
  },
};

// Default export for convenience
export default {
  theme: {
    extend: themeExtensions,
  },
};
