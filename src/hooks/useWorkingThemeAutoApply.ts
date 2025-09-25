import { useEffect, useRef } from 'react';
import { useTheme } from 'theme-o-rama';
import {
  DESIGN_THEME_NAME,
  useWorkingThemeState,
} from './useWorkingThemeState';

/**
 * Custom hook that automatically applies working theme changes when the working theme is selected.
 * This prevents the need to duplicate the auto-apply logic across multiple pages.
 */
export const useWorkingThemeAutoApply = () => {
  const { currentTheme, setCustomTheme, isLoading } = useTheme();
  const { WorkingTheme, getInitializedWorkingTheme } = useWorkingThemeState();

  const hasAppliedWorkingTheme = useRef(false);

  // Apply the working theme at startup only once, but only if working theme is already selected
  useEffect(() => {
    if (
      !isLoading &&
      WorkingTheme &&
      !hasAppliedWorkingTheme.current &&
      currentTheme?.name === DESIGN_THEME_NAME
    ) {
      const workingThemeJson = JSON.stringify(getInitializedWorkingTheme());
      setCustomTheme(workingThemeJson);
      hasAppliedWorkingTheme.current = true;
    }
  }, [isLoading, WorkingTheme, getInitializedWorkingTheme, setCustomTheme, currentTheme?.name]);

  // Auto-apply working theme changes when working theme is currently selected
  useEffect(() => {
    if (
      !isLoading &&
      currentTheme?.name === DESIGN_THEME_NAME &&
      hasAppliedWorkingTheme.current
    ) {
      const workingThemeJson = JSON.stringify(getInitializedWorkingTheme());
      setCustomTheme(workingThemeJson);
    }
  }, [
    isLoading,
    currentTheme?.name,
    WorkingTheme,
    getInitializedWorkingTheme,
    setCustomTheme,
  ]);

  return {
    isWorkingThemeSelected: currentTheme?.name === DESIGN_THEME_NAME,
  };
};
