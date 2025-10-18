'use client';

import { useCallback, useState } from 'react';
import { ThemeProvider } from 'theme-o-rama';

interface ProvidersProps {
  children: React.ReactNode;
  initialTheme: string;
}

export function Providers({ children, initialTheme }: ProvidersProps) {
  // Read actual theme from localStorage on client
  const [defaultTheme] = useState(() => {
    if (typeof window === 'undefined') return initialTheme;
    try {
      return localStorage.getItem('theme') || initialTheme;
    } catch {
      return initialTheme;
    }
  });

  // Handle theme changes - save to localStorage
  const handleThemeChange = useCallback((themeName: string) => {
    try {
      localStorage.setItem('theme', themeName);
      console.log('Theme saved:', themeName);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }, []);

  return (
    <ThemeProvider
      defaultTheme={defaultTheme}
      onThemeChange={handleThemeChange}
    >
      {children}
    </ThemeProvider>
  );
}
