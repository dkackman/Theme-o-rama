# Theme-o-rama Next.js Pages Router Test

This is a test harness for the `theme-o-rama` library using **Next.js 15 Pages Router**.

## Features

- ✅ Next.js 15 Pages Router
- ✅ React 19
- ✅ Tailwind CSS v4.1.14
- ✅ TypeScript
- ✅ SSR-compatible theming
- ✅ FOUC prevention
- ✅ Theme persistence with localStorage
- ✅ Custom theme support

## Getting Started

### Install Dependencies

```bash
pnpm install
```

### Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) (runs on port 3001 to avoid conflict with App Router version).

### Build for Production

```bash
pnpm build
pnpm start
```

## Project Structure

```bash
src-nextjs-pages/
├── public/
│   └── themes/              # Theme assets (images, etc.)
│       └── colorful/
├── src/
│   ├── pages/
│   │   ├── _app.tsx        # App wrapper with ThemeProvider
│   │   ├── _document.tsx   # Custom document with FOUC script
│   │   └── index.tsx       # Home page
│   ├── styles/
│   │   └── globals.css     # Global styles + Tailwind v4
│   └── themes/
│       └── colorful.json   # Custom theme definition
├── package.json
├── next.config.ts
├── tsconfig.json
└── postcss.config.mjs
```

## Key Differences from App Router

### 1. File Structure

- **App Router**: `src/app/layout.tsx`, `src/app/page.tsx`
- **Pages Router**: `src/pages/_app.tsx`, `src/pages/_document.tsx`, `src/pages/index.tsx`

### 2. ThemeProvider Location

- **App Router**: Wrapped in separate `Providers` component (client boundary)
- **Pages Router**: Directly in `_app.tsx` (already client-side)

### 3. FOUC Script Location

- **App Router**: In `layout.tsx` `<head>`
- **Pages Router**: In `_document.tsx` `<Head>`

### 4. CSS Import

- **App Router**: In `layout.tsx`
- **Pages Router**: In `_app.tsx`

## How It Works

### Theme Loading

1. **`_document.tsx`** runs a blocking script to prevent FOUC
2. **`_app.tsx`** wraps the app with `ThemeProvider`
3. **`ThemeProvider`** loads themes and applies them
4. **`localStorage`** persists theme selection

### Custom Themes

Add custom themes in `src/themes/`:

```json
{
  "name": "my-theme",
  "displayName": "My Theme",
  "mostLike": "light",
  "colors": {
    "background": "hsl(0, 0%, 100%)",
    "foreground": "hsl(0, 0%, 0%)"
  }
}
```

Reference in `_app.tsx`:

```tsx
import myTheme from "../themes/my-theme.json";

async function discoverThemes(): Promise<Theme[]> {
  return [myTheme as Theme];
}
```

## Tailwind v4

This project uses **Tailwind CSS v4**, which has a different configuration approach:

- ❌ No `tailwind.config.ts` file
- ✅ Configuration via `@theme` directive in CSS
- ✅ Built-in PostCSS
- ✅ Faster builds

See `src/styles/globals.css` for the `@theme` configuration.

## Documentation

- [Setup Guide](./SETUP.md)
- [Testing Guide](./TESTING.md)
- [Tailwind v4 Migration](./TAILWIND_V4_MIGRATION.md)

## Comparison with App Router

Both versions are functionally identical but demonstrate different integration patterns:

| Feature            | App Router                   | Pages Router                  |
| ------------------ | ---------------------------- | ----------------------------- |
| **Theme Provider** | Separate `Providers` wrapper | Directly in `_app.tsx`        |
| **FOUC Script**    | `layout.tsx`                 | `_document.tsx`               |
| **CSS Import**     | `layout.tsx`                 | `_app.tsx`                    |
| **File Structure** | `app/` directory             | `pages/` directory            |
| **Complexity**     | Slightly more complex        | Simpler, more straightforward |

Choose based on your Next.js routing preference!
