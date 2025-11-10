import { type Theme } from "theme-o-rama";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
interface ThemePreviewContentProps {
  theme: Theme | null;
}

export function ThemePreviewContent({ theme }: ThemePreviewContentProps) {
  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">{theme?.displayName ?? "Theme"} Preview</h1>
      </div>

      {/* Current Theme Info */}
      <Card className="space-y-4">
        <CardHeader>
          <CardTitle>Theme Details</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>Theme information</CardDescription>
          <div className="space-y-2 text-left">
            <p>
              <strong>Name:</strong> {theme?.name || "None"}
            </p>
            <p>
              <strong>Display Name:</strong> {theme?.displayName || "None"}
            </p>
            <p>
              <strong>Inherits:</strong> {theme?.inherits || "N/A"}
            </p>
            <p>
              <strong>Most Like:</strong> {theme?.mostLike || "N/A"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Test Components */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Test Components</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription>Various test components to preview the theme</CardDescription>
          {/* Buttons */}
          <div className="space-y-2">
            <h3 className="font-medium">Buttons</h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>

          {/* Cards */}
          <div className="space-y-2">
            <h3 className="font-medium">Cards</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Card className="space-y-2">
                <CardHeader>
                  <CardTitle>Card 1</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>This is a card with themed styling.</CardDescription>
                </CardContent>
              </Card>
              <Card className="space-y-2">
                <CardHeader>
                  <CardTitle>Card 2</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Cards adapt to the current theme.</CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-2">
            <h3 className="font-medium">Color Palette</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-sm bg-primary p-3 text-primary-foreground">Primary</div>
              <div className="rounded-sm bg-secondary p-3 text-secondary-foreground">Secondary</div>
              <div className="rounded-sm bg-muted p-3 text-muted-foreground">Muted</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
