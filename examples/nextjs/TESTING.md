# Testing Checklist for Next.js Compatibility

This document outlines what to test to verify theme-o-rama works correctly with Next.js.

## Pre-Test Setup

1. Build the library:

   ```bash
   cd ../src-lib
   npm run build
   cd ../src-nextjs
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

## SSR Testing

### Test 1: Server-Side Rendering

- [ ] Run `npm run build`
- [ ] Run `npm start`
- [ ] Open <http://localhost:3000>
- [ ] **Expected**: Page loads without errors
- [ ] **Expected**: No console errors about `localStorage` or `document`

### Test 2: Development Server

- [ ] Run `npm run dev`
- [ ] Open <http://localhost:3000>
- [ ] **Expected**: Development mode works
- [ ] **Expected**: Hot reload works
- [ ] **Expected**: No hydration warnings

### Test 3: View Page Source

- [ ] View page source (right-click → View Page Source)
- [ ] **Expected**: HTML is rendered
- [ ] **Expected**: Blocking script is present in `<head>`
- [ ] **Expected**: No JavaScript errors in source

## Theme Persistence Testing

### Test 4: Theme Switching

- [ ] Click "Dark" theme button
- [ ] **Expected**: Theme changes immediately
- [ ] **Expected**: Background/colors update
- [ ] **Expected**: No visual glitches

### Test 5: Page Refresh

- [ ] Select "Dark" theme
- [ ] Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
- [ ] **Expected**: Dark theme persists
- [ ] **Expected**: No flash of light theme (FOUC)

### Test 6: localStorage Verification

- [ ] Open DevTools → Application → Local Storage
- [ ] Switch to "Colorful" theme
- [ ] **Expected**: `theme` key = `"colorful"`
- [ ] **Expected**: Value updates on theme change

## FOUC Prevention Testing

### Test 7: Blocking Script

- [ ] Clear localStorage
- [ ] Set theme to "Dark"
- [ ] Hard refresh multiple times
- [ ] **Expected**: Dark theme appears immediately
- [ ] **Expected**: No white flash before theme loads

### Test 8: Network Throttling

- [ ] Open DevTools → Network → Throttle to "Slow 3G"
- [ ] Hard refresh
- [ ] **Expected**: Theme class applied before React loads
- [ ] **Expected**: Minimal/no FOUC even on slow connection

## Component Testing

### Test 9: Theme Context

- [ ] Verify all theme buttons are clickable
- [ ] **Expected**: Current theme indicator shows correct theme
- [ ] **Expected**: Button highlights active theme

### Test 10: Styled Components

- [ ] Check button colors
- [ ] Check card backgrounds
- [ ] Check text colors
- [ ] **Expected**: All components respect current theme

## Build Testing

### Test 11: Production Build

- [ ] Run `npm run build`
- [ ] **Expected**: Build completes successfully
- [ ] **Expected**: No TypeScript errors
- [ ] **Expected**: No React warnings

### Test 12: Production Runtime

- [ ] Run `npm start` (after build)
- [ ] Test all theme functionality
- [ ] **Expected**: Works identically to dev mode
- [ ] **Expected**: Optimized bundle loads quickly

## Edge Cases

### Test 13: No localStorage Available

- [ ] Open DevTools → Console
- [ ] Run: `delete window.localStorage`
- [ ] Try changing themes
- [ ] **Expected**: No crashes (warnings in console OK)
- [ ] **Expected**: Theme changes still work visually

### Test 14: Invalid Theme in localStorage

- [ ] Set `localStorage.setItem('theme', 'invalid-theme-name')`
- [ ] Refresh page
- [ ] **Expected**: Falls back to 'light' theme
- [ ] **Expected**: No errors

### Test 15: Multiple Tabs

- [ ] Open theme in tab 1
- [ ] Set to "Dark" theme
- [ ] Open same URL in tab 2
- [ ] **Expected**: Tab 2 loads with Dark theme
- [ ] **Expected**: Both tabs show same theme

## Pass Criteria

All tests should pass with:

- ✅ No console errors
- ✅ No hydration warnings
- ✅ No FOUC (or minimal)
- ✅ Theme persists correctly
- ✅ Builds successfully
- ✅ Works in production mode

## Known Limitations

- Themes apply **after** client hydration (not during SSR)
- Blocking script minimizes but doesn't eliminate FOUC
- Full CSS variables only applied on client side
- This is normal and expected for dynamic theming systems
