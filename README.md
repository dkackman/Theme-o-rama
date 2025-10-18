<a href="https://www.npmjs.com/package/theme-o-rama"><img src="https://img.shields.io/npm/v/theme-o-rama.svg?sanitize=true" alt="Version"></a>

# Theme-o-rama

A reusable library for dynamic theme management in React applications with shadcn/ui and Tailwind CSS. Features advanced theme discovery, inheritance, custom theme support, and dynamic theme switching at runtime. This is used by the [Sage Wallet](https://github.com/Chia-Network/sage-wallet).

## Quick Start

### Prerequisites (for the testharness app)

1. **PNPM** - Install via [pnpm.io](https://pnpm.io/installation)

### Prerequisites (for the theme-o-rama library)

1. **Rust** - Install via [Rustup](https://rustup.rs)
2. **Tauri dependencies** - Follow [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)

### Building & Running

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm build:web
pnpm preview:web
```

Navigate to `http://localhost:4174/`

## Browsing Themes

As you create and modify your themes, you can preview them in the theme selector by running `pnpm tauri dev`. Updates will be automatically reflected in the UI when you save your changes.

A more functional theme editor is available over a [Theme-a-roo](https://github.com/dkackman/theme-a-roo).

### Theme Structure

Themes are JSON files located in `src/themes/[theme-name]/theme.json`. Each theme must include:

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

- **Light** (`src/themes/light/`) - Clean, minimal light theme
- **Dark** (`src/themes/dark/`) - Dark theme inheriting from light
- **Colorful** (`src/themes/colorful/`) - Vibrant theme with background image and custom styling

### Testing Your Theme

1. Create your theme folder: `src/themes/my-theme/`
2. Add `theme.json` with your theme definition
3. Run `pnpm tauri dev` to see your theme in the theme selector
4. Navigate to the Themes page to preview and test your theme

### Theme Validation

Themes are automatically validated against the schema defined in `src/themes/schema.json`. Invalid themes will show error messages in the console.

## Development

This is a Tauri-based application with:

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Rust with Tauri v2
- **UI Components**: Shadcn/ui components

For more detailed development information, see the main [Sage Wallet repository](https://github.com/Chia-Network/sage-wallet).
