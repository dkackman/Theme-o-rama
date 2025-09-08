# Theme-o-rama

A TypeScript library for theme management with comprehensive type definitions for UI theming.

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

function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}

function YourComponent() {
  const { currentTheme, setTheme, setCustomTheme } = useTheme();

  return (
    <div>
      <button onClick={() => setTheme('dark')}>
        Switch to Dark Theme
      </button>
      <button onClick={() => setCustomTheme(themeJson)}>
        Apply Custom Theme
      </button>
    </div>
  );
}
```

## Features

- Comprehensive TypeScript definitions for theme objects
- Support for colors, fonts, corners, shadows, and component-specific styling
- Built-in support for sidebar, table, button, and switch configurations
- Type-safe theme validation and management
- JSON schema for theme validation and IDE support
- Tailwind CSS integration with theme-specific extensions

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

MIT
