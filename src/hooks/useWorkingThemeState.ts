import { STORAGE_KEYS } from '@/lib/constants';
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
  setBackgroundImage: (url: string | null) => void;
  getBackgroundImage: () => string | null;
  setBackdropFilters: (enabled: boolean) => void;
  getBackdropFilters: () => boolean;
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
        set((state) => ({ WorkingTheme: { ...state.WorkingTheme, inherits } })),
      setMostLike: (mostLike: MostLikeType) =>
        set((state) => ({ WorkingTheme: { ...state.WorkingTheme, mostLike } })),
      clearWorkingTheme: () => {
        // Clear localStorage background image
        localStorage.removeItem(STORAGE_KEYS.BACKGROUND_IMAGE);
        set({
          WorkingTheme: {
            name: DESIGN_THEME_NAME,
            displayName: 'New Theme',
            schemaVersion: 1,
            inherits: 'color',
          },
        });
      },
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
      setBackgroundImage: (url: string | null) => {
        if (url && (url.startsWith('data:') || url.startsWith('blob:'))) {
          // Store data URI/blob in localStorage and use sentinel value
          localStorage.setItem(STORAGE_KEYS.BACKGROUND_IMAGE, url);
          set((state) => ({
            WorkingTheme: {
              ...state.WorkingTheme,
              backgroundImage: '{LOCAL_STORAGE}',
              colors: {
                ...state.WorkingTheme.colors,
                background: url ? 'transparent' : undefined,
              },
            },
          }));
        } else {
          // Regular URL - store directly
          set((state) => ({
            WorkingTheme: {
              ...state.WorkingTheme,
              backgroundImage: url || undefined,
              colors: {
                ...state.WorkingTheme.colors,
                background: url ? 'transparent' : undefined,
              },
            },
          }));
        }
      },
      getBackgroundImage: () => {
        const backgroundImage = get().WorkingTheme.backgroundImage;
        if (backgroundImage === '{LOCAL_STORAGE}') {
          return localStorage.getItem(STORAGE_KEYS.BACKGROUND_IMAGE);
        }
        return backgroundImage || null;
      },
      setBackdropFilters: (enabled: boolean) => {
        set((state) => ({
          WorkingTheme: {
            ...state.WorkingTheme,
            colors: {
              ...state.WorkingTheme.colors,
              cardBackdropFilter: enabled ? 'blur(10px)' : null,
              popoverBackdropFilter: enabled ? 'blur(10px)' : null,
              inputBackdropFilter: enabled ? 'blur(10px)' : null,
            },
          },
        }));
      },
      getBackdropFilters: () => {
        const theme = get().WorkingTheme;
        return Boolean(
          theme.colors?.cardBackdropFilter ||
          theme.colors?.popoverBackdropFilter ||
          theme.colors?.inputBackdropFilter
        );
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
