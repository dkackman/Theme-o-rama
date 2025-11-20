# Using theme-o-rama with Next.js Pages Router

The library works identically with both App Router and Pages Router. Here's how to set it up:

## Setup for Pages Router

### 1. Create `pages/_app.tsx`

```typescript
import type { AppProps } from 'next/app';
import { ThemeProvider } from 'theme-o-rama';
import { useCallback, useState } from 'react';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  // Read initial theme from localStorage on client
  const [defaultTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    try {
      return localStorage.getItem('theme') || 'light';
    } catch {
      return 'light';
    }
  });

  // Handle theme changes - save to localStorage
  const handleThemeChange = useCallback((themeName: string) => {
    try {
      localStorage.setItem('theme', themeName);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }, []);

  return (
    <ThemeProvider
      defaultTheme={defaultTheme}
      onThemeChange={handleThemeChange}
    >
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
```

### 2. Create `pages/_document.tsx` (with FOUC prevention)

```typescript
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  const blockingScript = `(function(){try{var t=localStorage.getItem('theme')||'light';document.documentElement.className='theme-'+t;document.documentElement.setAttribute('data-theme',t);document.documentElement.style.colorScheme=t==='dark'?'dark':'light'}catch(e){console.error('Theme init error:',e)}})();`;

  return (
    <Html suppressHydrationWarning>
      <Head>
        {/* Blocking script to prevent FOUC */}
        <script dangerouslySetInnerHTML={{ __html: blockingScript }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

### 3. Create `styles/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    color-scheme: light;
  }

  :root[data-theme="dark"],
  :root.theme-dark {
    color-scheme: dark;
  }

  html {
    transition:
      background-color 0.2s ease,
      color 0.2s ease;
  }

  body {
    min-height: 100vh;
    background: var(--background);
    color: var(--foreground);
  }
}

@layer components {
  .card {
    @apply rounded-lg border bg-card text-card-foreground shadow-sm;
  }
}
```

### 4. Update `tailwind.config.js`

```javascript
// @ts-check
const { themeExtensions } = require("theme-o-rama/tailwind.config.js");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      ...themeExtensions,
    },
  },
  plugins: [],
};
```

### 5. Create a page: `pages/index.tsx`

```typescript
import { useTheme } from 'theme-o-rama';

export default function Home() {
  const { currentTheme, setTheme, availableThemes } = useTheme();

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">Theme-o-rama Pages Router</h1>

      <div className="space-y-4">
        <p>Current Theme: {currentTheme?.displayName || 'None'}</p>

        <div className="flex gap-2">
          {availableThemes.map(theme => (
            <button
              key={theme.name}
              onClick={() => setTheme(theme.name)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded"
            >
              {theme.displayName}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## Key Differences from App Router

| Aspect           | App Router               | Pages Router             |
| ---------------- | ------------------------ | ------------------------ |
| **Setup File**   | `app/layout.tsx`         | `pages/_app.tsx`         |
| **FOUC Script**  | In `layout.tsx` `<head>` | In `pages/_document.tsx` |
| **'use client'** | Required                 | Not needed               |
| **CSS Import**   | In layout                | In `_app.tsx`            |
| **Hydration**    | Automatic                | Automatic                |

## Benefits - Same for Both

✅ **SSR-safe** - No localStorage/document errors  
✅ **No FOUC** - Blocking script prevents flash  
✅ **Theme persistence** - Saved to localStorage  
✅ **Type-safe** - Full TypeScript support  
✅ **Storage-agnostic** - Use any storage via `onThemeChange`

## Answer: Yes, It Works Identically

The library is **router-agnostic**. The only differences are:

- Where you put the `<ThemeProvider>` wrapper
- Where you put the blocking script

Everything else (hooks, callbacks, theme loading) works exactly the same! 🎉
