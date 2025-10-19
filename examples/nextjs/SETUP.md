# Setup Instructions

## Quick Start

1. **Install dependencies:**

   ```bash
   cd src-nextjs
   npm install
   ```

2. **Run development server:**

   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## What to Test

### ✅ SSR Compatibility

- Refresh the page - theme should persist
- View page source - should render without errors
- Check browser console - no hydration warnings

### ✅ Theme Switching

- Click different theme buttons
- Theme should change immediately
- Theme should persist after page refresh
- localStorage should be updated

### ✅ FOUC Prevention

- Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
- Theme should appear immediately
- No flash of default theme

### ✅ Build Test

```bash
npm run build
npm start
```

Should build without errors and run in production mode.

## Key Files

- `src/app/layout.tsx` - Root layout with blocking script
- `src/app/providers.tsx` - ThemeProvider wrapper with storage
- `src/app/page.tsx` - Main page with theme controls
- `src/app/globals.css` - Global styles + theme-o-rama CSS

## Architecture

```bash
Client Request → Server
                   ↓
              SSR Render
       (No theme applied, safe defaults)
                   ↓
            HTML + Blocking Script
                   ↓
              Browser
                   ↓
        Blocking Script Runs
     (Applies theme class from localStorage)
                   ↓
           React Hydrates
                   ↓
        ThemeProvider Initializes
     (Applies full theme with CSS vars)
                   ↓
          Theme Fully Applied
              (No FOUC!)
```

## Troubleshooting

### Theme doesn't persist

- Check browser localStorage in DevTools
- Verify `onThemeChange` callback is firing

### FOUC still occurs

- Ensure blocking script is in `<head>`
- Check that `suppressHydrationWarning` is on `<html>`

### Build fails

- Run `npm install` in `src-lib` first
- Run `npm run build` in `src-lib`
- Then run `npm install` in `src-nextjs`
