import React, { createContext, useContext, useEffect, useState } from 'react';
import { getPlatformSync } from '../lib/platform';
import { getWebSafeAreaInsets, type Insets } from '../lib/web-fallbacks';

const defaultInsets: Insets = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
};

const SafeAreaContext = createContext<Insets>(defaultInsets);

export function SafeAreaProvider({ children }: { children: React.ReactNode }) {
  const [insets, setInsets] = useState<Insets>(defaultInsets);

  const isMobile =
    getPlatformSync() === 'ios' || getPlatformSync() === 'android';

  useEffect(() => {
    async function loadInsets() {
      try {
        // Try Tauri API first, fallback to web
        if (typeof window !== 'undefined' && '__TAURI__' in window) {
          const { getInsets } = await import('tauri-plugin-safe-area-insets');
          const newInsets = await getInsets();
          setInsets(newInsets);
        } else {
          // Web fallback
          const newInsets = getWebSafeAreaInsets();
          setInsets(newInsets);
        }
      } catch (error) {
        console.error('Failed to load insets:', error);
        // Fallback to web implementation
        const newInsets = getWebSafeAreaInsets();
        setInsets(newInsets);
      }
    }

    if (isMobile) {
      loadInsets();
    }
  }, [isMobile]);

  return (
    <SafeAreaContext.Provider value={insets}>
      {children}
    </SafeAreaContext.Provider>
  );
}

export function useInsets() {
  const context = useContext(SafeAreaContext);
  if (context === undefined) {
    throw new Error('useSafeArea must be used within a SafeAreaProvider');
  }
  return context;
}
