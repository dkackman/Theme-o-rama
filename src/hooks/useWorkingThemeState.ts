import { Theme, useTheme } from 'theme-o-rama';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type InheritsType = 'light' | 'dark' | 'color' | undefined;
type MostLikeType = 'light' | 'dark' | undefined;

interface WorkingThemeState {
  WorkingTheme: Theme;
  setTheme: (theme: Theme) => void;
  setThemeDisplayName: (displayName: string) => void;
  setInherits: (inherits: InheritsType) => void;
  setMostLike: (mostLike: MostLikeType) => void;
}

const DESIGN_THEME_NAME = 'theme-a-roo-working-theme';
const useWorkingThemeStateStore = create<WorkingThemeState>()(
  persist(
    (set) => ({
      WorkingTheme: {
        name: DESIGN_THEME_NAME,
        displayName: 'Design',
        schemaVersion: 1,
        inherits: 'color',
      },
      setTheme: (theme: Theme) => set({ WorkingTheme: theme }),
      setThemeDisplayName: (displayName: string) =>
        set((state) => ({
          WorkingTheme: { ...state.WorkingTheme, displayName },
        })),
      setInherits: (inherits: InheritsType) =>
        set((state) => {
          const newTheme = { ...state.WorkingTheme, inherits };
          // Auto-set mostLike when inherits is set to light or dark
          if (inherits === 'light' || inherits === 'dark') {
            newTheme.mostLike = inherits;
          }
          return { WorkingTheme: newTheme };
        }),
      setMostLike: (mostLike: MostLikeType) =>
        set((state) => ({ WorkingTheme: { ...state.WorkingTheme, mostLike } })),
    }),
    {
      name: 'working-theme-storage', // unique name for localStorage key
    },
  ),
);

// Custom hook that combines the store with theme context
export const useWorkingThemeState = () => {
  const store = useWorkingThemeStateStore();
  const themeContext = useTheme();

  const getInitializedWorkingTheme = (): Theme => {
    if (store.WorkingTheme.name === DESIGN_THEME_NAME) {
      return themeContext.initializeTheme(store.WorkingTheme);
    }

    return store.WorkingTheme;
  };

  return {
    ...store,
    getInitializedWorkingTheme: getInitializedWorkingTheme,
  };
};
