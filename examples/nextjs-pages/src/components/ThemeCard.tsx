import { Check, Palette } from "lucide-react";
import { useEffect, useRef } from "react";
import { applyThemeIsolated, Theme } from "theme-o-rama";

interface ThemeCardProps {
  theme: Theme | null;
  isSelected: boolean;
  onSelect: (theme: Theme) => void;
  className?: string;
}

export function ThemeCard({ theme, isSelected, onSelect, className = "" }: ThemeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current && theme) {
      applyThemeIsolated(theme, cardRef.current);
    }
  }, [theme]);

  // Only apply selection outline as inline style
  const selectionStyle = isSelected
    ? {
        outline: `2px solid ${theme?.colors?.primary || "hsl(220 13% 91%)"}`,
      }
    : {};

  const renderDefaultContent = () => {
    const checkStyles: Record<string, string | undefined> = {};
    if (theme?.colors?.primary) {
      checkStyles.color = theme?.colors.primary;
    } else {
      checkStyles.color = "hsl(220 13% 91%)"; // Default gray
    }

    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-sm text-foreground font-heading">
            {theme?.displayName || "Get started"}
          </h3>
          <div className="flex items-center gap-2">
            {isSelected && <Check className="h-4 w-4" style={checkStyles} />}
          </div>
        </div>

        {/* Theme preview */}
        <div className="space-y-2">
          <div className="h-8 flex items-center px-2 bg-primary text-primary-foreground rounded-md shadow-button">
            <span className="text-xs font-medium font-body">Aa</span>
          </div>
          <div className="flex gap-1">
            <div className="h-4 w-4 bg-primary rounded-sm" />
            <div className="h-4 w-4 bg-secondary rounded-sm" />
            <div className="h-4 w-4 bg-accent rounded-sm" />
            <div className="h-4 w-4 bg-destructive rounded-sm" />
          </div>
          {theme && (
            <div className="text-xs truncate text-muted-foreground font-body">
              {theme.fonts?.heading?.split(",")[0] || "Default"}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!theme) {
    return (
      <div
        className={`border-2 border-dashed border-border rounded-lg p-6 text-center ${className}`}
      >
        <Palette className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
        <h3 className="font-medium text-sm text-foreground mb-2">No Theme</h3>
      </div>
    );
  }

  return (
    <>
      <div
        ref={cardRef}
        className={`cursor-pointer transition-all hover:opacity-90 text-card-foreground border border-border rounded-lg shadow-card theme-card-isolated ${
          isSelected ? "ring-2" : "hover:ring-1"
        } ${className}`}
        style={selectionStyle}
        onClick={() => theme && onSelect(theme)}
      >
        {renderDefaultContent()}
      </div>
    </>
  );
}
