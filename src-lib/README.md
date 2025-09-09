# Theme-o-rama

A comprehensive TypeScript library for dynamic theme management in React applications with shadcn/ui and Tailwind CSS. Features advanced theme discovery, inheritance, custom theme support, and dynamic theme switching at runtime.

## Installation

```bash
npm install theme-o-rama
```

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

### JSON Schema

Theme-o-rama also provides a JSON schema for theme validation:

```javascript
// Import the schema for validation
import schema from 'theme-o-rama/schema.json';

// Use with your favorite JSON schema validator
import Ajv from 'ajv';
const ajv = new Ajv();
const validate = ajv.compile(schema);
```

### React Integration

```typescript
import { ThemeProvider, useTheme } from 'theme-o-rama';
import 'theme-o-rama/themes.css';

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
    currentTheme,
    setTheme,
    setCustomTheme,
    availableThemes,
    isLoading,
    error,
    lastUsedNonCoreTheme,
    reloadThemes
  } = useTheme();

  if (isLoading) return <div>Loading themes...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={() => setTheme('amiga')}>
        Switch to Dark Theme
      </button>
      <button onClick={() => setCustomTheme(themeJson)}>
        Apply Custom Theme
      </button>
      <button onClick={reloadThemes}>
        Reload Themes
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

### Theme Discovery and Image Resolution

Theme-o-rama supports dynamic theme discovery through the `discoverThemes` prop. Standard `light` and `dark` themes are always included.

This allows you to load themes from various sources:

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
  inherits: 'dark', // Inherits from base theme
  colors: {
    background: '#1a1a1a',
    foreground: '#ffffff',
    // primary is inherited from base theme
  },
  // fonts and corners are inherited from base theme
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

## Features

- **Comprehensive TypeScript definitions** for theme objects with full type safety
- **Dynamic theme discovery** with support for file system, API, and static imports
- **Theme inheritance** allowing themes to extend and override other themes
- **Custom theme support** with JSON validation and runtime theme application
- **Background image support** with automatic image resolution and CSS variable injection
- **Component-specific styling** for:
  - **Tables**: Headers, rows, cells, footers with hover and selection states
  - **Buttons**: Multiple variants (default, outline, secondary, destructive, ghost, link) with hover/active states
  - **Switches**: Custom checked/unchecked states and thumb styling
  - **Sidebars**: Background, borders, and backdrop filters
- **Advanced CSS features**:
  - Backdrop filters with webkit fallbacks
  - Button style flags (gradient, shimmer, pixel-art, 3D effects, rounded buttons)
  - Comprehensive color system with transparent variants
  - Font family management with CSS variables
  - Border radius and shadow systems
- **Theme persistence** with localStorage integration and migration support
- **Error handling** with loading states and validation feedback
- **JSON schema validation** for theme structure validation and IDE support
- **Tailwind CSS integration** with theme-specific extensions and CSS variables
- **React hooks** for theme management with comprehensive state handling

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
