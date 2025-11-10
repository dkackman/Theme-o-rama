import { ThemePreview } from "@/components/ThemePreview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSimpleTheme } from "theme-o-rama";
import landscape from "../../public/themes/landscape/theme.json";
import { ThemeSelector } from "../components/ThemeSelector";

const THEME_JSON = JSON.stringify(landscape);

const validateThemeJson = (json: string) => {
  try {
    JSON.parse(json);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : "Invalid theme JSON";
  }
};

export default function Home() {
  const { currentTheme, isLoading } = useSimpleTheme();

  if (isLoading) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading themes...</p>
          </div>
        </div>
        <ThemePreview themeJson={THEME_JSON} validateTheme={validateThemeJson} />
      </>
    );
  }

  return (
    <>
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Theme-o-rama + Next.js</h1>
            <p className="text-muted-foreground">
              Testing theme-o-rama library in Next.js 15 Pages Router
            </p>
          </div>

          {/* Current Theme Info */}
          <Card className="p-6 space-y-4">
            <CardHeader>
              <CardTitle>Current Theme</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>Name:</strong> {currentTheme?.name || "None"}
                </p>
                <p>
                  <strong>Display Name:</strong> {currentTheme?.displayName || "None"}
                </p>
                <p>
                  <strong>Most Like:</strong> {currentTheme?.mostLike || "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Available Themes</CardTitle>
            </CardHeader>
            <CardContent>
              <ThemeSelector />
            </CardContent>
          </Card>

          {/* Test Components */}
          <div className="p-6 space-y-4 rounded-lg border bg-card text-card-foreground shadow-sm">
            <h2 className="text-2xl font-semibold">Theme Test Components</h2>

            <div className="space-y-4">
              {/* Buttons */}
              <div className="space-y-2">
                <h3 className="font-medium">Buttons</h3>
                <div className="flex gap-2 flex-wrap">
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90">
                    Primary
                  </button>
                  <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:opacity-90">
                    Secondary
                  </button>
                  <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:opacity-90">
                    Destructive
                  </button>
                </div>
              </div>

              {/* Cards */}
              <div className="space-y-2">
                <h3 className="font-medium">Cards</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <h4 className="font-semibold mb-2">Card 1</h4>
                    <p className="text-muted-foreground">This is a card with themed styling.</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <h4 className="font-semibold mb-2">Card 2</h4>
                    <p className="text-muted-foreground">Cards adapt to the current theme.</p>
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-2">
                <h3 className="font-medium">Color Palette</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-3 bg-background text-foreground border rounded">Background</div>
                  <div className="p-3 bg-primary text-primary-foreground rounded">Primary</div>
                  <div className="p-3 bg-secondary text-secondary-foreground rounded">
                    Secondary
                  </div>
                  <div className="p-3 bg-muted text-muted-foreground rounded">Muted</div>
                </div>
              </div>
            </div>
          </div>

          {/* SSR Test Info */}
          <div className="p-6 space-y-4 rounded-lg border bg-accent/10 shadow-sm">
            <h2 className="text-2xl font-semibold">SSR Compatibility</h2>
            <div className="space-y-2 text-sm">
              <p>✅ No server-side errors</p>
              <p>✅ No hydration mismatches</p>
              <p>✅ Theme persists across page reloads</p>
              <p>✅ FOUC prevented with blocking script</p>
              <p>✅ Works with Next.js App and Pages Routers</p>
            </div>
          </div>
        </div>
      </main>
      <ThemePreview themeJson={THEME_JSON} validateTheme={validateThemeJson} />
    </>
  );
}
