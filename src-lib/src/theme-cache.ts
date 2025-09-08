import dark from './dark.json';
import light from './light.json';
import { Theme } from './theme.type';

export class ThemeCache {
  private themesCache: Map<string, Theme>;

  constructor() {
    this.themesCache = new Map<string, Theme>();
    this.themesCache.set('dark', dark as Theme);
    this.themesCache.set('light', light as Theme);
  }

  public getThemeSafe(themeName: string | null): Theme {
    let theme = this.themesCache.get(themeName || 'light');
    if (theme) {
      return theme;
    }

    theme = this.themesCache.get('light');
    if (theme) {
      return theme;
    }

    if (this.themesCache.size > 0) {
      return Array.from(this.themesCache.values())[0];
    }

    return light as Theme;
  }

  public getTheme(name: string): Theme | undefined {
    return this.themesCache.get(name);
  }

  public setTheme(theme: Theme): void {
    this.themesCache.set(theme.name, theme);
  }

  public setThemes(themes: Theme[]): void {
    themes.forEach((theme) => this.setTheme(theme));
  }

  public getThemes(): Theme[] {
    return Array.from(this.themesCache.values());
  }

  public removeTheme(name: string): void {
    this.themesCache.delete(name);
  }

  public invalidate(): void {
    this.themesCache.clear();
    this.themesCache.set('dark', dark as Theme);
    this.themesCache.set('light', light as Theme);
  }
}
