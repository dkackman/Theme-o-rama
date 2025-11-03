import { useCallback, useEffect } from "react";

const LAST_ACTIVE_THEME_KEY = "lastActiveTheme";

/**
 * Hook to manage the last active theme name in localStorage
 */
export function useLastActiveTheme() {
  /**
   * Get the last active theme name from localStorage
   */
  const getLastActiveTheme = useCallback((): string | null => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(LAST_ACTIVE_THEME_KEY);
    } catch (error) {
      console.warn("Failed to get last active theme from localStorage:", error);
      return null;
    }
  }, []);

  /**
   * Save the last active theme name to localStorage
   */
  const setLastActiveTheme = useCallback((themeName: string): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LAST_ACTIVE_THEME_KEY, themeName);
    } catch (error) {
      console.warn("Failed to save last active theme to localStorage:", error);
    }
  }, []);

  /**
   * Clear the last active theme from localStorage
   */
  const clearLastActiveTheme = useCallback((): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(LAST_ACTIVE_THEME_KEY);
    } catch (error) {
      console.warn("Failed to clear last active theme from localStorage:", error);
    }
  }, []);

  return {
    getLastActiveTheme,
    setLastActiveTheme,
    clearLastActiveTheme,
  };
}

