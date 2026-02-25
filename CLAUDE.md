# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository has two distinct parts:

1. **`src-lib/`** — The `theme-o-rama` npm library (published to npm). Contains the core theme engine: `ThemeProvider`, `useTheme`, `ThemeLoader`, `ThemeCache`, and the `Theme` TypeScript type.
2. **Root / `src/`** — A Tauri + React demo/preview app that consumes the library. Also serves as a GitHub Pages web preview (`pnpm build:web`).

The app is deprecated in favor of [Theme-a-roo](https://github.com/dkackman/theme-a-roo). The library itself (`theme-o-rama`) is actively maintained.

## Commands

### App (root)

```bash
pnpm install          # Install dependencies
pnpm build:web        # Build web-only version (outputs to dist-web/)
pnpm preview:web      # Serve web build at http://localhost:4174/
pnpm lint             # ESLint
pnpm prettier         # Format all files
pnpm prettier:check   # Check formatting without writing
pnpm clean            # Remove dist/ and dist-web/
```

### Tauri desktop app

```bash
pnpm tauri dev        # Run desktop app in dev mode (hot reload)
pnpm tauri build      # Build desktop app
```

### Library (`src-lib/`)

```bash
cd src-lib
pnpm run build        # Compile TS + generate schema.json + copy assets to dist/
pnpm run dev          # Watch mode (tsc --watch)
pnpm run clean        # Remove dist/
```

### Publishing the web preview (GitHub Pages)

```bash
./publish.sh          # prettier → build:web → copies dist-web/ to docs/
```

## Architecture

### Library (`src-lib/src/`)

- **`theme.type.ts`** — The canonical `Theme` interface. The JSON schema (`schema.json`) is auto-generated from this via `typescript-json-schema`. Modify this file when adding new theme properties.
- **`theme-loader.ts`** — `ThemeLoader` class: loads themes, resolves inheritance (via `deepMerge`), resolves background images via an injectable `ImageResolver`.
- **`theme-cache.ts`** — `ThemeCache`: in-memory store for loaded themes, with safe fallback to `light`.
- **`theme-context.tsx`** — `ThemeProvider` and `useTheme` hook. On init, always loads the three core themes (`light`, `dark`, `color`) then calls the app-provided `discoverThemes()`. Persists selected theme name to `localStorage` under the key `"theme"`.
- **`theme.ts`** — `applyTheme()` / `applyThemeIsolated()`: writes CSS custom properties onto a DOM element.
- **`theme-schema-validation.ts`** — `validateTheme()`: validates raw JSON against the generated schema.
- **`index.ts`** — Public API surface.

### App (`src/`)

- **`src/lib/themes.ts`** — App-specific implementations of `discoverThemes` (uses `import.meta.glob` to find `src/themes/*/theme.json`) and `resolveThemeImage` (resolves local image assets or `localStorage` data URLs).
- **`src/lib/web-fallbacks.ts`** — Browser polyfills for Tauri APIs (clipboard, platform detection, safe area insets) used when running as a web app.
- **`src/bindings.ts`** — Tauri command bindings.
- **`src/pages/`** — Route-level components: `Themes`, `Components`, `Design`, `Dialogs`, `Tables`, `ThemePreview`, `About`.
- **`src/contexts/ErrorContext.tsx`** — Global error state.
- **`src/themes/`** — Theme JSON files, one per subdirectory (`light/`, `dark/`, `colorful/`, etc.).

### Tauri (`src-tauri/`)

Minimal Rust backend. Only plugins used: `tauri-plugin-fs`, `tauri-plugin-dialog`, `tauri-plugin-window-state`. No custom Rust commands — all logic is in the frontend.

## Key Patterns

**Theme inheritance**: A theme with `"inherits": "dark"` deep-merges on top of the named base theme. The base theme must already be loaded in the cache. Core themes (`light`, `dark`, `color`) are always loaded first.

**Dual build targets**: `vite.config.ts` for Tauri (port 1425, excludes Tauri packages from optimization). `vite.config.web.ts` for web-only (port 3000/preview 4174, sets `__TAURI__: false`, outputs to `dist-web/`).

**Path alias**: `@` resolves to `src/` in both Vite configs.

**Schema generation**: When modifying `Theme` in `src-lib/src/theme.type.ts`, run `pnpm run build` in `src-lib/` to regenerate `schema.json`. The schema is exported from the npm package.

**Rust lints**: `unsafe_code` is denied. Clippy `all` is denied at error level. `pedantic` is warn. Keep Rust code minimal.
