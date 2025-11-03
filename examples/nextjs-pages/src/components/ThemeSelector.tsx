import { Loader2 } from "lucide-react";
import { dark, light, Theme, useSimpleTheme } from "theme-o-rama";
import { useDiscoveredThemes } from "../hooks/useDiscoveredThemes";
import { useLastActiveTheme } from "../hooks/useLastActiveTheme";
import { ThemeCard } from "./ThemeCard";

export function ThemeSelector() {
  const { currentTheme, setTheme, isLoading: isContextLoading, error } = useSimpleTheme();
  const { themes: discoveredThemes, isLoading: isDiscovering } = useDiscoveredThemes();
  const { setLastActiveTheme } = useLastActiveTheme();

  // Wrapper to save theme when it's selected
  const handleThemeSelect = (theme: Theme) => {
    setTheme(theme);
    setLastActiveTheme(theme.name);
  };

  const isLoading = isContextLoading || isDiscovering;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
        <span className="ml-2">Loading themes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-destructive">
        <p>Error loading themes: {error}</p>
      </div>
    );
  }

  const defaultThemes = [light, dark];

  return (
    <div className="space-y-8">
      {/* Default Themes */}
      {defaultThemes.length > 0 && (
        <div className="rounded-lg bg-card text-card-foreground shadow-card p-8">
          <h3 className="text-lg font-semibold mb-4 text-card-foreground">Default Themes</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {defaultThemes.map((theme: Theme) => (
              <ThemeCard
                key={theme.name}
                theme={theme}
                isSelected={currentTheme?.name === theme.name}
                onSelect={handleThemeSelect}
              />
            ))}
          </div>
        </div>
      )}

      {/* Discovered Themes from public/themes folder */}
      {discoveredThemes.length > 0 && (
        <div className="rounded-lg bg-card text-card-foreground shadow-card p-8">
          <h3 className="text-lg font-semibold mb-4 text-card-foreground">
            Custom Themes ({discoveredThemes.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {discoveredThemes.map((theme: Theme) => (
              <ThemeCard
                key={theme.name}
                theme={theme}
                isSelected={currentTheme?.name === theme.name}
                onSelect={handleThemeSelect}
              />
            ))}
          </div>
        </div>
      )}

      {discoveredThemes.length === 0 && !isLoading && (
        <div className="text-center p-8 text-muted-foreground">
          <p>No custom themes found in public/themes folder</p>
        </div>
      )}
    </div>
  );
}
