# Theme-o-rama

A comprehensive TypeScript library for dynamic theme management in React applications with shadcn/ui and Tailwind CSS. Features advanced theme discovery, inheritance, custom theme support, and dynamic theme switching at runtime.

## Requirements

- **React** 18.0+ or 19.0+
- **TypeScript** 5.0+ (optional, but recommended)

The library uses only stable React APIs and is compatible with all React 18.x and 19.x versions.

## Installation

```bash
npm install theme-o-rama
# or
pnpm add theme-o-rama
# or
yarn add theme-o-rama
```

## Framework Compatibility

Theme-o-rama is designed to work seamlessly with:

- ✅ **Vite** + React
- ✅ **Create React App**
- ✅ **Next.js** (Pages Router & App Router)
- ✅ **Remix**
- ✅ Any React SSR framework

The library is SSR-safe and includes proper guards for server-side rendering environments.

## Usage

### Basic Theme Definition

```typescript
import { Theme } from 'theme-o-rama';

const myTheme: Theme = {
  name: 'my-theme',
  displayName: 'My Custom Theme',
  schemaVersion: 1,
  colors: {
    background: '#ffffff',
    foreground: '#000000',
    primary: '#007bff',
    // ... other theme properties
  },
};
```

### Tailwind CSS Integration

Theme-o-rama provides Tailwind CSS extensions that work with the dynamic theming system. To use them in your app:

```css
@import 'theme-o-rama/themes.css';
```

```javascript
// tailwind.config.js
import { themeExtensions } from 'theme-o-rama/tailwind.config.js';

export default {
  darkMode: ['class'],
  content: ['src/**/*.{ts,tsx}', 'index.html'],
  theme: {
    extend: {
      // Include Theme-o-rama theme extensions
      ...themeExtensions,

      // Add your app-specific extensions here
      // keyframes: { ... },
      // animation: { ... },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
```

The `themeExtensions` include:

- **Font families** with CSS variables (`--font-sans`, `--font-serif`, etc.)
- **Border radius** with CSS variables (`--corner-sm`, `--corner-md`, etc.)
- **Box shadows** with CSS variables (`--shadow-sm`, `--shadow-md`, etc.)
- **Color system** with CSS variables (`--background`, `--foreground`, etc.)

### React Integration

```typescript
import { ThemeProvider, useTheme } from 'theme-o-rama';

// Theme discovery function (optional)
async function discoverThemes() {
  // Your theme discovery logic here
  // Can load themes from API, file system, etc.
  return [
    { name: 'colorful', displayName: 'Colorful', schemaVersion: 1, colors: { /* ... */ } },
    { name: 'amiga', displayName: 'Amiga', schemaVersion: 1, colors: { /* ... */ } },
    // ... more themes
  ];
}

// Image resolver function (optional)
function resolveThemeImage(themeName: string, imagePath: string) {
  // Resolve theme background images
  return `/themes/${themeName}/${imagePath}`;
}

function App() {
  return (
    <ThemeProvider
      discoverThemes={discoverThemes}
      imageResolver={resolveThemeImage}
    >
      <YourApp />
    </ThemeProvider>
  );
}

function YourComponent() {
  const {
    setTheme,
    availableThemes,
    isLoading,
    error,
  } = useTheme();

  if (isLoading) return <div>Loading themes...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={() => setTheme('amiga')}>
        Switch to Amiga Theme
      </button>

      {/* Display available themes */}
      <div>
        {availableThemes.map(theme => (
          <button
            key={theme.name}
            onClick={() => setTheme(theme.name)}
            className={currentTheme?.name === theme.name ? 'active' : ''}
          >
            {theme.displayName}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### Next.js Integration

Theme-o-rama is fully compatible with Next.js (both Pages Router and App Router). The library is SSR-safe with proper guards for server-side rendering.

#### Next.js App Router (13+)

```typescript
// app/layout.tsx
import { ThemeProvider } from 'theme-o-rama';
import 'theme-o-rama/themes.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

#### Next.js Pages Router

```typescript
// pages/_app.tsx
import type { AppProps } from 'next/app';
import { ThemeProvider } from 'theme-o-rama';
import 'theme-o-rama/themes.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
```

#### Using Themes in Next.js Components

```typescript
// app/components/ThemeSelector.tsx (or pages/components/ThemeSelector.tsx)
'use client'; // Only needed for App Router

import { useTheme } from 'theme-o-rama';

export function ThemeSelector() {
  const { setTheme, currentTheme, availableThemes } = useTheme();

  return (
    <select
      value={currentTheme?.name || 'light'}
      onChange={(e) => setTheme(e.target.value)}
    >
      {availableThemes.map(theme => (
        <option key={theme.name} value={theme.name}>
          {theme.displayName}
        </option>
      ))}
    </select>
  );
}
```

**Note:** The `ThemeProvider` component automatically includes the `'use client'` directive, making it compatible with Next.js App Router. Any component using the `useTheme` hook should also be a Client Component.

#### Preventing Flash of Unstyled Content (FOUC)

Since themes are applied client-side after hydration, you may notice a brief flash of default styling. To minimize this, add a blocking script that applies the theme before React hydrates:

**Next.js App Router:**

```typescript
// app/layout.tsx
import { ThemeProvider } from 'theme-o-rama';
import 'theme-o-rama/themes.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Blocking script to prevent FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'light';

                  // Apply theme class immediately
                  document.documentElement.className = 'theme-' + theme;
                  document.documentElement.setAttribute('data-theme', theme);

                  // Set color-scheme for browser UI
                  document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
                } catch (e) {
                  console.error('Theme initialization error:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Next.js Pages Router:**

```typescript
// pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html suppressHydrationWarning>
      <Head>
        {/* Blocking script to prevent FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'light';

                  // Apply theme class immediately
                  document.documentElement.className = 'theme-' + theme;
                  document.documentElement.setAttribute('data-theme', theme);

                  // Set color-scheme for browser UI
                  document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
                } catch (e) {
                  console.error('Theme initialization error:', e);
                }
              })();
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

**What this script does:**

- Runs before React hydration (blocking)
- Reads theme from localStorage
- Sets `theme-{name}` class on `<html>` element
- Sets `data-theme` attribute for CSS targeting
- Sets `color-scheme` for native browser UI elements
- Provides basic theme indication before full theme loads

**Add supporting CSS for instant feedback:**

```css
/* In your global CSS or theme-o-rama/themes.css */
:root {
  color-scheme: light;
}

:root[data-theme='dark'],
:root.theme-dark {
  color-scheme: dark;
}

/* Optional: Add basic color transitions for smooth theme changes */
html {
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}
```

The `suppressHydrationWarning` prop on `<html>` is needed because the blocking script modifies the DOM before React hydration, which would otherwise cause a warning.

### Theme Discovery and Image Resolution

Theme-o-rama supports dynamic theme discovery through the `discoverThemes` prop. Standard `light` and `dark` themes are always included.

This allows you to load themes from source of your choice:

```typescript
// Example: Loading themes from a file system (Vite)
async function discoverThemes() {
  const themeModules = import.meta.glob('../themes/*/theme.json', {
    eager: true,
  });

  return Object.entries(themeModules)
    .map(([path, module]) => {
      const match = path.match(/\.\.\/themes\/([^/]+)\/theme\.json$/);
      if (match) {
        return module as Theme;
      }
      return null;
    })
    .filter((theme): theme is Theme => theme !== null);
}

// Example: Loading themes from an API
async function discoverThemesFromAPI() {
  const response = await fetch('/api/themes');
  return response.json();
}

// Example: Loading themes from static imports
async function discoverStaticThemes() {
  return [
    await import('./themes/amiga.json'),
    await import('./themes/colorful.json'),
  ];
}
```

The `imageResolver` prop allows you to resolve theme background images:

```typescript
// Example: Resolving local theme images
function resolveThemeImage(themeName: string, imagePath: string) {
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

// Example: Resolving remote images
function resolveRemoteThemeImage(themeName: string, imagePath: string) {
  return `https://your-cdn.com/themes/${themeName}/${imagePath}`;
}
```

### Advanced Usage

#### Theme Inheritance

Themes can inherit from other themes and override specific properties:

```typescript
// Inherited theme
const darkTheme: Theme = {
  name: 'my-dark',
  displayName: 'Dark Theme',
  schemaVersion: 1,
  inherits: 'dark', // Inherits from dark theme
  colors: {
    background: '#1a1a1a',
    foreground: '#ffffff',
    // primary is inherited from dark theme
  },
  // fonts and corners are inherited from dark theme
};
```

#### Custom Theme with Component Styling

```typescript
const customTheme: Theme = {
  name: 'cyberpunk',
  displayName: 'Cyberpunk',
  schemaVersion: 1,
  mostLike: 'dark',
  backgroundImage: 'cyberpunk-bg.jpg',
  backgroundSize: 'cover',
  colors: {
    background: '#0a0a0a',
    foreground: '#00ff41',
    primary: '#ff0080',
    secondary: '#00ffff',
    accent: '#ffff00',
    destructive: '#ff0040',
    border: '#00ff41',
    card: 'rgba(0, 255, 65, 0.1)',
    cardForeground: '#00ff41',
  },
  fonts: {
    sans: 'Orbitron, monospace',
    mono: 'JetBrains Mono, monospace',
  },
  corners: {
    sm: '2px',
    md: '4px',
    lg: '8px',
  },
  shadows: {
    sm: '0 0 10px #00ff41',
    md: '0 0 20px #00ff41',
    lg: '0 0 30px #00ff41',
  },
  // Custom button styling
  buttons: {
    default: {
      background: 'linear-gradient(45deg, #ff0080, #00ffff)',
      color: '#000000',
      border: '2px solid #00ff41',
      borderRadius: '4px',
      boxShadow: '0 0 15px #00ff41',
      hover: {
        background: 'linear-gradient(45deg, #ff40a0, #40ffff)',
        transform: 'scale(1.05)',
        boxShadow: '0 0 25px #00ff41',
      },
      active: {
        transform: 'scale(0.95)',
      },
    },
    outline: {
      background: 'transparent',
      color: '#00ff41',
      border: '2px solid #00ff41',
      hover: {
        background: 'rgba(0, 255, 65, 0.1)',
        boxShadow: '0 0 15px #00ff41',
      },
    },
  },
  // Button style flags for CSS effects
  buttonStyles: ['gradient', 'shimmer'],
  // Custom table styling
  tables: {
    background: 'rgba(0, 255, 65, 0.05)',
    border: '1px solid #00ff41',
    borderRadius: '8px',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)',
    header: {
      background: 'rgba(0, 255, 65, 0.1)',
      color: '#00ff41',
      border: '1px solid #00ff41',
      fontWeight: 'bold',
      backdropFilter: 'blur(10px)',
    },
    row: {
      background: 'transparent',
      color: '#ffffff',
      hover: {
        background: 'rgba(0, 255, 65, 0.1)',
        color: '#00ff41',
      },
      selected: {
        background: 'rgba(255, 0, 128, 0.2)',
        color: '#ff0080',
      },
    },
  },
  // Custom switch styling
  switches: {
    checked: {
      background: 'linear-gradient(45deg, #ff0080, #00ffff)',
    },
    unchecked: {
      background: '#333333',
    },
    thumb: {
      background: '#ffffff',
    },
  },
  // Sidebar styling
  sidebar: {
    background: 'rgba(0, 255, 65, 0.1)',
    border: '1px solid #00ff41',
    backdropFilter: 'blur(20px)',
  },
};
```

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Watch for changes during development
npm run dev

# Clean build artifacts
npm run clean
```

## License

Apache 2.0
