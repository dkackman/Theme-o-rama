import { useCallback, useMemo } from 'react';
import { Theme } from 'theme-o-rama';
import { useLocalStorage } from 'usehooks-ts';

const WORKING_THEME_KEY = 'theme-o-rama-working-theme';

export function useWorkingTheme() {
    const [workingThemeJson, setWorkingThemeJson] = useLocalStorage<string | null>(
        WORKING_THEME_KEY,
        null,
    );

    const workingTheme = useMemo(() => {
        if (!workingThemeJson) return null;
        try {
            return JSON.parse(workingThemeJson) as Theme;
        } catch (error) {
            console.error('Error parsing working theme JSON:', error);
            return null;
        }
    }, [workingThemeJson]);

    const updateWorkingTheme = useCallback((theme: Theme | null) => {
        if (theme) {
            setWorkingThemeJson(JSON.stringify(theme, null, 2));
        } else {
            setWorkingThemeJson(null);
        }
    }, [setWorkingThemeJson]);

    const updateWorkingThemeFromJson = useCallback((json: string | null) => {
        setWorkingThemeJson(json);
    }, [setWorkingThemeJson]);

    const clearWorkingTheme = useCallback(() => {
        setWorkingThemeJson(null);
    }, [setWorkingThemeJson]);

    const hasWorkingTheme = workingTheme !== null;

    return {
        workingTheme,
        workingThemeJson,
        updateWorkingTheme,
        updateWorkingThemeFromJson,
        clearWorkingTheme,
        hasWorkingTheme,
    };
}

