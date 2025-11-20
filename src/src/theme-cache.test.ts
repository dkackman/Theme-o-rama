import { describe, it, expect, beforeEach } from "vitest";
import { ThemeCache } from "./theme-cache";
import { Theme } from "./theme.type";

describe("ThemeCache", () => {
  let cache: ThemeCache;

  beforeEach(() => {
    cache = new ThemeCache();
  });

  describe("addTheme and getTheme", () => {
    it("should add and retrieve a theme", () => {
      const theme: Theme = {
        name: "test",
        displayName: "Test Theme",
        schemaVersion: 1,
      };

      cache.addTheme(theme);
      const retrieved = cache.getTheme("test");

      expect(retrieved).toEqual(theme);
    });

    it("should return undefined for non-existent theme", () => {
      const retrieved = cache.getTheme("non-existent");
      expect(retrieved).toBeUndefined();
    });

    it("should overwrite theme with same name", () => {
      const theme1: Theme = {
        name: "test",
        displayName: "Test Theme 1",
        schemaVersion: 1,
      };

      const theme2: Theme = {
        name: "test",
        displayName: "Test Theme 2",
        schemaVersion: 1,
      };

      cache.addTheme(theme1);
      cache.addTheme(theme2);

      const retrieved = cache.getTheme("test");
      expect(retrieved?.displayName).toBe("Test Theme 2");
    });
  });

  describe("addThemes", () => {
    it("should add multiple themes at once", () => {
      const themes: Theme[] = [
        { name: "theme1", displayName: "Theme 1", schemaVersion: 1 },
        { name: "theme2", displayName: "Theme 2", schemaVersion: 1 },
        { name: "theme3", displayName: "Theme 3", schemaVersion: 1 },
      ];

      cache.addThemes(themes);

      expect(cache.getTheme("theme1")).toBeDefined();
      expect(cache.getTheme("theme2")).toBeDefined();
      expect(cache.getTheme("theme3")).toBeDefined();
    });
  });

  describe("getThemes", () => {
    it("should return empty array when cache is empty", () => {
      const themes = cache.getThemes();
      expect(themes).toEqual([]);
    });

    it("should return all cached themes", () => {
      const theme1: Theme = {
        name: "theme1",
        displayName: "Theme 1",
        schemaVersion: 1,
      };
      const theme2: Theme = {
        name: "theme2",
        displayName: "Theme 2",
        schemaVersion: 1,
      };

      cache.addTheme(theme1);
      cache.addTheme(theme2);

      const themes = cache.getThemes();
      expect(themes).toHaveLength(2);
      expect(themes).toContainEqual(theme1);
      expect(themes).toContainEqual(theme2);
    });
  });

  describe("getThemeSafe", () => {
    it("should return requested theme when it exists", () => {
      const theme: Theme = {
        name: "custom",
        displayName: "Custom Theme",
        schemaVersion: 1,
      };

      cache.addTheme(theme);
      const retrieved = cache.getThemeSafe("custom");

      expect(retrieved).toEqual(theme);
    });

    it("should fallback to light theme when requested theme not found", () => {
      const lightTheme: Theme = {
        name: "light",
        displayName: "Light",
        schemaVersion: 1,
      };

      cache.addTheme(lightTheme);
      const retrieved = cache.getThemeSafe("non-existent");

      expect(retrieved).toEqual(lightTheme);
    });

    it("should fallback to light theme when null is passed", () => {
      const lightTheme: Theme = {
        name: "light",
        displayName: "Light",
        schemaVersion: 1,
      };

      cache.addTheme(lightTheme);
      const retrieved = cache.getThemeSafe(null);

      expect(retrieved).toEqual(lightTheme);
    });

    it("should return first available theme if light theme not found", () => {
      const theme: Theme = {
        name: "custom",
        displayName: "Custom Theme",
        schemaVersion: 1,
      };

      cache.addTheme(theme);
      const retrieved = cache.getThemeSafe("non-existent");

      expect(retrieved).toEqual(theme);
    });

    it("should return built-in light theme as last resort", () => {
      const retrieved = cache.getThemeSafe("non-existent");

      expect(retrieved).toBeDefined();
      expect(retrieved.name).toBe("light");
    });
  });

  describe("removeTheme", () => {
    it("should remove a theme from cache", () => {
      const theme: Theme = {
        name: "test",
        displayName: "Test Theme",
        schemaVersion: 1,
      };

      cache.addTheme(theme);
      expect(cache.getTheme("test")).toBeDefined();

      cache.removeTheme("test");
      expect(cache.getTheme("test")).toBeUndefined();
    });

    it("should not throw when removing non-existent theme", () => {
      expect(() => cache.removeTheme("non-existent")).not.toThrow();
    });
  });

  describe("invalidate", () => {
    it("should clear all themes from cache", () => {
      const themes: Theme[] = [
        { name: "theme1", displayName: "Theme 1", schemaVersion: 1 },
        { name: "theme2", displayName: "Theme 2", schemaVersion: 1 },
        { name: "theme3", displayName: "Theme 3", schemaVersion: 1 },
      ];

      cache.addThemes(themes);
      expect(cache.getThemes()).toHaveLength(3);

      cache.invalidate();
      expect(cache.getThemes()).toHaveLength(0);
    });

    it("should return built-in light theme after invalidation", () => {
      const theme: Theme = {
        name: "custom",
        displayName: "Custom Theme",
        schemaVersion: 1,
      };

      cache.addTheme(theme);
      cache.invalidate();

      const retrieved = cache.getThemeSafe("custom");
      expect(retrieved.name).toBe("light");
    });
  });
});
