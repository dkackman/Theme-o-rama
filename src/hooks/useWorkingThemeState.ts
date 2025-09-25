import { hslToRgb, makeValidFileName, rgbToHsl } from '@/lib/utils';
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
  clearWorkingTheme: () => void;
  deriveThemeName: () => string;
  setWorkingThemeFromCurrent: (currentTheme: Theme) => void;
  setWorkingThemeFromJson: (json: string) => void;
  setThemeColor: ({ r, g, b }: { r: number; g: number; b: number }) => void;
  getThemeColor: () => { r: number; g: number; b: number };
}

export const DESIGN_THEME_NAME = 'theme-a-roo-working-theme';
const useWorkingThemeStateStore = create<WorkingThemeState>()(
  persist(
    (set, get) => ({
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
      clearWorkingTheme: () =>
        set({
          WorkingTheme: {
            name: DESIGN_THEME_NAME,
            displayName: 'New Theme',
            schemaVersion: 1,
            inherits: 'color',
          },
        }),
      deriveThemeName: () => {
        return makeValidFileName(get().WorkingTheme.displayName);
      },
      setWorkingThemeFromCurrent: (currentTheme: Theme) => {
        const workingThemeCopy = {
          ...currentTheme,
          name: DESIGN_THEME_NAME,
          displayName: currentTheme.displayName || 'New Theme',
        };
        set({ WorkingTheme: workingThemeCopy });
      },
      setWorkingThemeFromJson: (json: string) => {
        try {
          const parsedTheme = JSON.parse(json) as Theme;
          const workingThemeCopy = {
            ...parsedTheme,
            name: DESIGN_THEME_NAME,
            displayName: parsedTheme.displayName || 'Imported Theme',
          };
          set({ WorkingTheme: workingThemeCopy });
        } catch (error) {
          console.error('Error parsing theme JSON:', error);
          throw new Error('Invalid theme JSON format');
        }
      },
      setThemeColor: ({ r, g, b }: { r: number; g: number; b: number }) => {
        const hsl = rgbToHsl(r, g, b);
        set((state) => ({
          WorkingTheme: {
            ...state.WorkingTheme,
            colors: {
              ...state.WorkingTheme.colors,
              themeColor: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
            },
          },
        }));
      },
      getThemeColor: () => {
        const rgb = hslToRgb(
          get().WorkingTheme.colors?.themeColor || 'hsl(220, 30%, 15%)',
        );
        return rgb || { r: 220, g: 30, b: 15 };
      },
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
