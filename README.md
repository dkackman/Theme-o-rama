# Theme-o-rama

[![npm version](https://img.shields.io/npm/v/theme-o-rama.svg?sanitize=true)](https://www.npmjs.com/package/theme-o-rama)
[![CI](https://github.com/dkackman/Theme-o-rama/actions/workflows/ci.yml/badge.svg)](https://github.com/dkackman/Theme-o-rama/actions/workflows/ci.yml)

A reusable TypeScript library for dynamic theme management in React applications with shadcn/ui and Tailwind CSS. Features smooth transitions, theme inheritance, custom theme support, SSR compatibility, and Tailwind v3/v4 support. Originally created for the [Sage Wallet](https://github.com/Chia-Network/sage-wallet).

## ✨ Features

- **Dynamic Theme Switching** - Smooth 300ms transitions between themes
- **Theme Inheritance** - Build themes on top of existing ones
- **Background Images** - Support for themed background images
- **SSR Compatible** - Works with Next.js App Router and Pages Router
- **Tailwind v3 & v4** - Compatible with both versions

## 📦 Installation

```bash
npm install theme-o-rama
# or
pnpm add theme-o-rama
# or
yarn add theme-o-rama
```

## 🚀 Quick Start

### 1. Import CSS and Wrap with Provider

```tsx
// App.tsx or _app.tsx
import { ThemeProvider } from 'theme-o-rama';
import 'theme-o-rama/themes.css';

export default function App({ children }) {
  return (
    <ThemeProvider defaultTheme="light">
      {children}
    </ThemeProvider>
  );
}
```

### 2. Configure Tailwind

```js
// tailwind.config.js
import { themeExtensions } from 'theme-o-rama/tailwind.config.js';

export default {
  theme: {
    extend: {
      ...themeExtensions,
      // Your custom extensions
    }
  }
}
```

### 3. Use Theme Hook

```tsx
import { useTheme } from 'theme-o-rama';

function ThemeSwitcher() {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  
  return (
    <select onChange={(e) => setTheme(e.target.value)}>
      {availableThemes.map(theme => (
        <option key={theme.name} value={theme.name}>
          {theme.displayName}
        </option>
      ))}
    </select>
  );
}
```

## 📚 Repository Structure

This is a monorepo containing:

- **`src/`** - The theme-o-rama library (publishable npm package)
- **`examples/tauri/`** - Full-featured Tauri app example
- **`examples/nextjs/`** - Next.js App Router example (Tailwind v4)
- **`examples/nextjs-pages/`** - Next.js Pages Router example (Tailwind v4)

## 🎨 Examples

### Tauri Example (Full-Featured)

```bash
cd examples/tauri
pnpm install
pnpm tauri dev
```

Features theme browsing, creation, and a complete theme editor.

### Next.js App Router Example

```bash
cd examples/nextjs
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### Next.js Pages Router Example

```bash
cd examples/nextjs-pages
pnpm install
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001)

## 🛠️ Development

### Working on the Library

```bash
# Install dependencies for all workspace packages
pnpm install

# Build the library
cd src
pnpm build

# Examples will automatically use the workspace version
```

### Prerequisites for Tauri Example

1. **Rust** - Install via [Rustup](https://rustup.rs)
2. **Tauri dependencies** - Follow [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)
3. **PNPM** - Install via [pnpm.io](https://pnpm.io/installation)

## 📖 Documentation

- [API Reference](./src/README.md) - Full library documentation

## 🎨 Theme Structure

Themes are JSON files. In the Tauri example, they're in `examples/tauri/src/themes/[theme-name]/theme.json`. Each theme must include:

```json
{
  "name": "my-theme",
  "displayName": "My Custom Theme",
  "schemaVersion": 1,
  "mostLike": "light",
  "colors": {
    /* color definitions */
  },
  "fonts": {
    /* font definitions */
  },
  "corners": {
    /* border radius values */
  },
  "shadows": {
    /* shadow definitions */
  }
}
```

### Required Fields

- `name`: Unique identifier (lowercase, no spaces)
- `displayName`: Human-readable name
- `schemaVersion`: Currently `1`
- `mostLike`: Either `"light"` or `"dark"` (affects icon selection)

### Theme Inheritance

Themes can inherit from other themes using the `inherits` property:

```json
{
  "name": "my-dark-theme",
  "displayName": "My Dark Theme",
  "inherits": "dark",
  "colors": {
    "primary": "hsl(220 70% 50%)",
    "accent": "hsl(280 100% 70%)"
  }
}
```

### Available Properties

#### Colors

Define the color palette for your theme:

```json
"colors": {
  "background": "hsl(0 0% 100%)",
  "foreground": "hsl(0 0% 3.9%)",
  "primary": "hsl(0 0% 9%)",
  "secondary": "hsl(0 0% 96.1%)",
  "accent": "hsl(0 0% 96.1%)",
  "destructive": "hsl(0 84.2% 60.2%)",
  "card": "hsl(0 0% 98%)",
  "popover": "hsl(0 0% 100%)",
  "border": "hsl(0 0% 89.8%)",
  "input": "hsl(0 0% 89.8%)"
}
```

#### Background Images

Add custom background images:

```json
{
  "backgroundImage": "background.jpg",
  "backgroundSize": "cover",
  "backgroundPosition": "center",
  "backgroundRepeat": "no-repeat"
}
```

#### Custom Button Styles

Define custom button appearances:

```json
"buttons": {
  "default": {
    "background": "hsl(220 70% 50%)",
    "color": "white",
    "borderRadius": "0.5rem",
    "hover": {
      "background": "hsl(220 70% 45%)",
      "transform": "scale(1.02)"
    }
  }
}
```

#### Advanced Features

- **Backdrop filters**: Add blur effects to cards and popovers
- **Table customization**: Style table headers, rows, and cells
- **Switch styling**: Customize toggle switch appearances
- **Button style flags**: Enable special effects like shimmer or gradients

### Example Themes

The Tauri example includes several themes:

- **Light** - Clean, minimal light theme
- **Dark** - Dark theme inheriting from light
- **Color** - Based on light with custom colors
- **Colorful** - Vibrant theme with background image
- **Glass Dark/Light** - Themes with backdrop blur effects
- **Circuit** - Tech-themed with circuit board background
- **Win95** - Windows 95 inspired retro theme
- **XCH Dark/Light** - Chia-branded themes

### Testing Your Theme

In the Tauri example:

1. Create your theme folder: `examples/tauri/src/themes/my-theme/`
2. Add `theme.json` with your theme definition
3. Run `pnpm tauri dev` to see your theme in the theme selector
4. Navigate to the Themes page to preview and test your theme

### Theme Validation

Themes are automatically validated against the JSON schema. Invalid themes will show error messages in the console.

## 🎛️ Theme Transitions

The library includes smooth CSS transitions (300ms by default) when switching themes. Customize or disable:

```css
:root {
  --theme-transition-duration: 500ms; /* Slower */
  --theme-transition-timing: ease-out; /* Custom easing */
}

/* Or disable */
:root {
  --theme-transition-duration: 0ms;
}
```

Automatically respects `prefers-reduced-motion` for accessibility.

See [THEME_TRANSITIONS.md](./THEME_TRANSITIONS.md) for details.

## 🔧 Advanced Features

### Custom Theme Discovery

```tsx
import { ThemeProvider } from 'theme-o-rama';

async function discoverThemes() {
  // Load your app-specific themes
  const customThemes = await loadCustomThemes();
  return customThemes;
}

<ThemeProvider discoverThemes={discoverThemes}>
  {children}
</ThemeProvider>
```

### Image Resolution

```tsx
async function resolveThemeImage(themeName, imagePath) {
  // Return URL for theme images
  return `/themes/${themeName}/${imagePath}`;
}

<ThemeProvider imageResolver={resolveThemeImage}>
  {children}
</ThemeProvider>
```

### Theme Persistence

```tsx
<ThemeProvider
  defaultTheme="light"
  onThemeChange={(themeName) => {
    localStorage.setItem('theme', themeName);
  }}
>
  {children}
</ThemeProvider>
```

## 📄 License

Apache-2.0 - See [LICENSE](./LICENSE) for details.

## 🙏 Acknowledgments

Originally created for the [Sage Wallet](https://github.com/Chia-Network/sage-wallet) project.

For a more complete theme editor, check out [Theme-a-roo](https://github.com/dkackman/theme-a-roo).
