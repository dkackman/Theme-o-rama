# Theme-o-rama Next.js Test Harness

This is a Next.js test application demonstrating the integration of `theme-o-rama` library with Next.js App Router.

## Features

- ✅ Next.js 15 with App Router
- ✅ React 19
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ theme-o-rama integration with SSR support
- ✅ FOUC prevention with blocking script
- ✅ localStorage-based theme persistence

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the development server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Key Implementation Details

### Theme Persistence

The app demonstrates proper theme persistence using localStorage with SSR safety:

- Initial theme is read from localStorage on client mount
- Theme changes are saved via `onThemeChange` callback
- Blocking script prevents FOUC during page load

### SSR Compatibility

All browser APIs are properly guarded:

- `localStorage` access is wrapped in try-catch with SSR checks
- `document` access only happens in the browser
- No hydration mismatches

## Project Structure

```bash
src-nextjs/
├── app/
│   ├── layout.tsx          # Root layout with ThemeProvider
│   ├── page.tsx            # Home page
│   ├── providers.tsx       # Client-side providers
│   └── globals.css         # Global styles
├── public/                 # Static assets
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind configuration
└── tsconfig.json           # TypeScript configuration
```
