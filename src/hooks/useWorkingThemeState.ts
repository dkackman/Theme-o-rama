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

const DEFAULT_THEME = {
  name: DESIGN_THEME_NAME,
  displayName: 'Design',
  schemaVersion: 1,
  inherits: 'color' as const,
  mostLike: 'light' as const,
};

const useWorkingThemeStateStore = create<WorkingThemeState>()(
  persist(
    (set, get) => ({
      WorkingTheme: DEFAULT_THEME,
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
        set({ WorkingTheme: DEFAULT_THEME });
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
              cardBackdropFilter: enabled
                ? 'blur(16px) saturate(180%) brightness(1.1)'
                : null,
              popoverBackdropFilter: enabled
                ? 'blur(20px) saturate(180%) brightness(1.1)'
                : null,
              inputBackdropFilter: enabled
                ? 'blur(8px) saturate(150%) brightness(1.05)'
                : null,
            },
            sidebar: {
              ...state.WorkingTheme.sidebar,
              backdropFilter: enabled
                ? 'blur(20px) saturate(180%) brightness(1.1)'
                : null,
            },
            tables: {
              ...state.WorkingTheme.tables,
              header: {
                ...state.WorkingTheme.tables?.header,
                backdropFilter: enabled
                  ? 'blur(8px) saturate(150%) brightness(1.05)'
                  : null,
              },
              row: {
                ...state.WorkingTheme.tables?.row,
                backdropFilter: enabled
                  ? 'blur(4px) saturate(120%) brightness(1.02)'
                  : null,
              },
              footer: {
                ...state.WorkingTheme.tables?.footer,
                backdropFilter: enabled
                  ? 'blur(8px) saturate(150%) brightness(1.05)'
                  : null,
              },
            },
          },
        }));
      },
      getBackdropFilters: () => {
        // This will be updated to use initialized theme in the hook
        const theme = get().WorkingTheme;
        return Boolean(
          theme.colors?.cardBackdropFilter ||
            theme.colors?.popoverBackdropFilter ||
            theme.colors?.inputBackdropFilter,
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

  const getBackdropFilters = () => {
    const initializedTheme = getInitializedWorkingTheme();

    // Check all backdrop filter properties in the theme
    const hasBackdropFilters = Boolean(
      // Colors backdrop filters
      initializedTheme.colors?.cardBackdropFilter ||
        initializedTheme.colors?.popoverBackdropFilter ||
        initializedTheme.colors?.inputBackdropFilter ||
        // Sidebar backdrop filter
        initializedTheme.sidebar?.backdropFilter ||
        // Table backdrop filters
        initializedTheme.tables?.header?.backdropFilter ||
        initializedTheme.tables?.row?.backdropFilter ||
        initializedTheme.tables?.footer?.backdropFilter,
    );

    return hasBackdropFilters;
  };

  return {
    ...store,
    getInitializedWorkingTheme: getInitializedWorkingTheme,
    getBackdropFilters: getBackdropFilters,
  };
};
