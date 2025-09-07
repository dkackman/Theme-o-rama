# Theme-o-rama

A TypeScript library for theme management with comprehensive type definitions for UI theming.

## Installation

```bash
npm install theme-o-rama
```

## Usage

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

## Features

- Comprehensive TypeScript definitions for theme objects
- Support for colors, fonts, corners, shadows, and component-specific styling
- Built-in support for sidebar, table, button, and switch configurations
- Type-safe theme validation and management

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
