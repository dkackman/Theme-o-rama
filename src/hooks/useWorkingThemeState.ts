import { Theme } from 'theme-o-rama';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type InheritsType = 'light' | 'dark' | 'color' | undefined;
type MostLikeType = 'light' | 'dark' | undefined;

interface WorkingThemeState {
    Theme: Theme;
    setTheme: (theme: Theme) => void;
    setThemeDisplayName: (displayName: string) => void;
    setInherits: (inherits: InheritsType) => void;
    setMostLike: (mostLike: MostLikeType) => void;
}

export const useWorkingThemeState = create<WorkingThemeState>()(
    persist(
        (set) => ({
            Theme: {
                name: 'theme-a-roo-working-theme',
                displayName: 'Design',
                schemaVersion: 1,
                inherits: 'color',
            },
            setTheme: (theme: Theme) => set({ Theme: theme }),
            setThemeDisplayName: (displayName: string) => set((state) => ({ Theme: { ...state.Theme, displayName } })),
            setInherits: (inherits: InheritsType) => set((state) => {
                const newTheme = { ...state.Theme, inherits };
                // Auto-set mostLike when inherits is set to light or dark
                if (inherits === 'light' || inherits === 'dark') {
                    newTheme.mostLike = inherits;
                }
                return { Theme: newTheme };
            }),
            setMostLike: (mostLike: MostLikeType) => set((state) => ({ Theme: { ...state.Theme, mostLike } })),
        }),
        {
            name: 'working-theme-storage', // unique name for localStorage key
        }
    )
);  