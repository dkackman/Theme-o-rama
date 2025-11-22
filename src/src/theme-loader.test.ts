import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeLoader } from "./theme-loader";
import { Theme } from "./theme.type";

describe("ThemeLoader", () => {
  let loader: ThemeLoader;

  beforeEach(() => {
    loader = new ThemeLoader();
  });

  describe("loadTheme", () => {
    it("should load a basic theme", async () => {
      const theme: Theme = {
        name: "test",
        displayName: "Test Theme",
        schemaVersion: 1,
      };

      await loader.loadTheme(theme);

      const loaded = loader.getTheme("test");
      expect(loaded).toBeDefined();
      expect(loaded?.name).toBe("test");
    });

    it("should load theme with all properties", async () => {
      const theme: Theme = {
        name: "complete",
        displayName: "Complete Theme",
        schemaVersion: 1,
        mostLike: "light",
        colors: {
          background: "hsl(0 0% 100%)",
          foreground: "hsl(0 0% 0%)",
        },
        fonts: {
          sans: "Inter, sans-serif",
        },
      };

      await loader.loadTheme(theme);

      const loaded = loader.getTheme("complete");
      expect(loaded?.colors?.background).toBe("hsl(0 0% 100%)");
      expect(loaded?.fonts?.sans).toBe("Inter, sans-serif");
    });

    it("should create deep copy of theme to avoid mutations", async () => {
      const theme: Theme = {
        name: "test",
        displayName: "Test Theme",
        schemaVersion: 1,
        colors: {
          background: "hsl(0 0% 100%)",
        },
      };

      await loader.loadTheme(theme);

      // Mutate original
      theme.colors!.background = "hsl(0 0% 0%)";

      // Loaded theme should not be affected
      const loaded = loader.getTheme("test");
      expect(loaded?.colors?.background).toBe("hsl(0 0% 100%)");
    });
  });

  describe("loadThemes", () => {
    it("should load multiple themes", async () => {
      const themes: Theme[] = [
        { name: "theme1", displayName: "Theme 1", schemaVersion: 1 },
        { name: "theme2", displayName: "Theme 2", schemaVersion: 1 },
        { name: "theme3", displayName: "Theme 3", schemaVersion: 1 },
      ];

      await loader.loadThemes(themes);

      expect(loader.getTheme("theme1")).toBeDefined();
      expect(loader.getTheme("theme2")).toBeDefined();
      expect(loader.getTheme("theme3")).toBeDefined();
    });

    it("should load themes in parallel", async () => {
      const themes: Theme[] = Array.from({ length: 10 }, (_, i) => ({
        name: `theme${i}`,
        displayName: `Theme ${i}`,
        schemaVersion: 1,
      }));

      const startTime = Date.now();
      await loader.loadThemes(themes);
      const duration = Date.now() - startTime;

      // Should complete quickly if parallel (arbitrary threshold)
      expect(duration).toBeLessThan(1000);
      expect(loader.getThemes()).toHaveLength(10);
    });
  });

  describe("loadThemeFromJson", () => {
    it("should load theme from valid JSON string", async () => {
      const themeJson = JSON.stringify({
        name: "json-theme",
        displayName: "JSON Theme",
        schemaVersion: 1,
      });

      const theme = await loader.loadThemeFromJson(themeJson);

      expect(theme.name).toBe("json-theme");
      expect(loader.getTheme("json-theme")).toBeDefined();
    });

    it("should load and cache theme from JSON", async () => {
      const themeJson = JSON.stringify({
        name: "cached-theme",
        displayName: "Cached Theme",
        schemaVersion: 1,
        colors: {
          background: "hsl(0 0% 50%)",
        },
      });

      await loader.loadThemeFromJson(themeJson);

      const cached = loader.getTheme("cached-theme");
      expect(cached?.colors?.background).toBe("hsl(0 0% 50%)");
    });

    it("should throw error for invalid JSON", async () => {
      await expect(loader.loadThemeFromJson("invalid json")).rejects.toThrow();
    });

    it("should throw error for JSON missing required fields", async () => {
      const invalidJson = JSON.stringify({
        name: "test",
        // missing displayName
        schemaVersion: 1,
      });

      await expect(loader.loadThemeFromJson(invalidJson)).rejects.toThrow();
    });

    it("should throw error for circular inheritance in JSON theme", async () => {
      // First load a parent theme
      const parentTheme: Theme = {
        name: "parent-json",
        displayName: "Parent Theme",
        schemaVersion: 1,
        colors: {
          background: "hsl(0 0% 100%)",
        },
      };

      await loader.loadTheme(parentTheme);

      // Now try to load a theme that creates a cycle with parent
      const circularThemeJson = JSON.stringify({
        name: "circular-json",
        displayName: "Circular Theme",
        schemaVersion: 1,
        inherits: "parent-json",
        colors: {
          foreground: "hsl(0 0% 0%)",
        },
      });

      // Load the child theme first (this is fine)
      await loader.loadThemeFromJson(circularThemeJson);

      // Now try to modify parent to inherit from child (creating cycle)
      // This should be detected when we try to initialize the modified parent
      const modifiedParent: Theme = {
        ...parentTheme,
        inherits: "circular-json", // Creates cycle: parent-json -> circular-json -> parent-json
      };

      await expect(loader.initializeTheme(modifiedParent)).rejects.toThrow(
        "Circular inheritance detected",
      );
    });
  });

  describe("getTheme and getThemes", () => {
    it("should return theme by name", async () => {
      const theme: Theme = {
        name: "test",
        displayName: "Test Theme",
        schemaVersion: 1,
      };

      await loader.loadTheme(theme);

      const retrieved = loader.getTheme("test");
      expect(retrieved?.name).toBe("test");
    });

    it("should return all loaded themes", async () => {
      const themes: Theme[] = [
        { name: "theme1", displayName: "Theme 1", schemaVersion: 1 },
        { name: "theme2", displayName: "Theme 2", schemaVersion: 1 },
      ];

      await loader.loadThemes(themes);

      const allThemes = loader.getThemes();
      expect(allThemes).toHaveLength(2);
      expect(allThemes.map((t) => t.name)).toContain("theme1");
      expect(allThemes.map((t) => t.name)).toContain("theme2");
    });

    it("should return fallback theme for non-existent theme", () => {
      const theme = loader.getTheme("non-existent");
      expect(theme).toBeDefined();
      expect(theme.name).toBe("light");
    });
  });

  describe("clearCache", () => {
    it("should clear all cached themes", async () => {
      const themes: Theme[] = [
        { name: "theme1", displayName: "Theme 1", schemaVersion: 1 },
        { name: "theme2", displayName: "Theme 2", schemaVersion: 1 },
      ];

      await loader.loadThemes(themes);
      expect(loader.getThemes()).toHaveLength(2);

      loader.clearCache();
      expect(loader.getThemes()).toHaveLength(0);
    });
  });

  describe("theme inheritance", () => {
    it("should inherit from parent theme", async () => {
      const parentTheme: Theme = {
        name: "parent",
        displayName: "Parent Theme",
        schemaVersion: 1,
        colors: {
          background: "hsl(0 0% 100%)",
          foreground: "hsl(0 0% 0%)",
          primary: "hsl(221 83% 53%)",
        },
      };

      const childTheme: Theme = {
        name: "child",
        displayName: "Child Theme",
        schemaVersion: 1,
        inherits: "parent",
        colors: {
          primary: "hsl(0 100% 50%)", // Override primary
        },
      };

      await loader.loadTheme(parentTheme);
      await loader.loadTheme(childTheme);

      const child = loader.getTheme("child");
      expect(child?.colors?.background).toBe("hsl(0 0% 100%)"); // Inherited
      expect(child?.colors?.foreground).toBe("hsl(0 0% 0%)"); // Inherited
      expect(child?.colors?.primary).toBe("hsl(0 100% 50%)"); // Overridden
    });

    it("should handle multi-level inheritance", async () => {
      const grandparentTheme: Theme = {
        name: "grandparent",
        displayName: "Grandparent Theme",
        schemaVersion: 1,
        colors: {
          background: "hsl(0 0% 100%)",
        },
      };

      const parentTheme: Theme = {
        name: "parent",
        displayName: "Parent Theme",
        schemaVersion: 1,
        inherits: "grandparent",
        colors: {
          foreground: "hsl(0 0% 0%)",
        },
      };

      const childTheme: Theme = {
        name: "child",
        displayName: "Child Theme",
        schemaVersion: 1,
        inherits: "parent",
        colors: {
          primary: "hsl(221 83% 53%)",
        },
      };

      await loader.loadTheme(grandparentTheme);
      await loader.loadTheme(parentTheme);
      await loader.loadTheme(childTheme);

      const child = loader.getTheme("child");
      expect(child?.colors?.background).toBe("hsl(0 0% 100%)"); // From grandparent
      expect(child?.colors?.foreground).toBe("hsl(0 0% 0%)"); // From parent
      expect(child?.colors?.primary).toBe("hsl(221 83% 53%)"); // From child
    });

    it("should preserve child theme tags when inheriting", async () => {
      const parentTheme: Theme = {
        name: "parent",
        displayName: "Parent Theme",
        schemaVersion: 1,
        tags: ["parent-tag"],
      };

      const childTheme: Theme = {
        name: "child",
        displayName: "Child Theme",
        schemaVersion: 1,
        inherits: "parent",
        tags: ["child-tag"],
      };

      await loader.loadTheme(parentTheme);
      await loader.loadTheme(childTheme);

      const child = loader.getTheme("child");
      expect(child?.tags).toEqual(["child-tag"]);
    });

    it("should throw error for self-inheritance", async () => {
      const selfInheritingTheme: Theme = {
        name: "self-theme",
        displayName: "Self Theme",
        schemaVersion: 1,
        inherits: "self-theme", // Inherits from itself
        colors: {
          background: "hsl(0 0% 100%)",
        },
      };

      await expect(loader.loadTheme(selfInheritingTheme)).rejects.toThrow(
        "cannot inherit from itself",
      );
    });

    it("should throw error for direct circular inheritance (A -> B -> A)", async () => {
      const themeA: Theme = {
        name: "theme-a",
        displayName: "Theme A",
        schemaVersion: 1,
        inherits: "theme-b",
        colors: {
          background: "hsl(0 0% 100%)",
        },
      };

      const themeB: Theme = {
        name: "theme-b",
        displayName: "Theme B",
        schemaVersion: 1,
        inherits: "theme-a", // Creates cycle: A -> B -> A
        colors: {
          foreground: "hsl(0 0% 0%)",
        },
      };

      await loader.loadTheme(themeA);
      await expect(loader.loadTheme(themeB)).rejects.toThrow("Circular inheritance detected");
    });

    it("should throw error when initializing theme with circular inheritance", async () => {
      const themeA: Theme = {
        name: "theme-a",
        displayName: "Theme A",
        schemaVersion: 1,
        colors: {
          background: "hsl(0 0% 100%)",
        },
      };

      const themeB: Theme = {
        name: "theme-b",
        displayName: "Theme B",
        schemaVersion: 1,
        inherits: "theme-a",
        colors: {
          foreground: "hsl(0 0% 0%)",
        },
      };

      const themeC: Theme = {
        name: "theme-c",
        displayName: "Theme C",
        schemaVersion: 1,
        inherits: "theme-b",
        colors: {
          primary: "hsl(221 83% 53%)",
        },
      };

      // Load themes normally first
      await loader.loadTheme(themeA);
      await loader.loadTheme(themeB);
      await loader.loadTheme(themeC);

      // Now create a circular dependency by making themeA inherit from themeC
      const circularThemeA: Theme = {
        ...themeA,
        inherits: "theme-c", // Creates cycle: A -> C -> B -> A
      };

      await expect(loader.initializeTheme(circularThemeA)).rejects.toThrow(
        "Circular inheritance detected",
      );
    });

    it("should not throw error for valid multi-level inheritance", async () => {
      const grandparentTheme: Theme = {
        name: "grandparent",
        displayName: "Grandparent Theme",
        schemaVersion: 1,
        colors: {
          background: "hsl(0 0% 100%)",
        },
      };

      const parentTheme: Theme = {
        name: "parent",
        displayName: "Parent Theme",
        schemaVersion: 1,
        inherits: "grandparent",
        colors: {
          foreground: "hsl(0 0% 0%)",
        },
      };

      const childTheme: Theme = {
        name: "child",
        displayName: "Child Theme",
        schemaVersion: 1,
        inherits: "parent",
        colors: {
          primary: "hsl(221 83% 53%)",
        },
      };

      // This should not throw - it's a valid inheritance chain
      await loader.loadTheme(grandparentTheme);
      await loader.loadTheme(parentTheme);
      await expect(loader.loadTheme(childTheme)).resolves.toBeUndefined();

      const child = loader.getTheme("child");
      expect(child?.colors?.background).toBe("hsl(0 0% 100%)"); // From grandparent
      expect(child?.colors?.foreground).toBe("hsl(0 0% 0%)"); // From parent
      expect(child?.colors?.primary).toBe("hsl(221 83% 53%)"); // From child
    });
  });

  describe("image resolution", () => {
    it("should resolve relative background image paths", async () => {
      const imageResolver = vi.fn(async (themeName: string, imagePath: string) => {
        return `/resolved/${themeName}/${imagePath}`;
      });

      const theme: Theme = {
        name: "test",
        displayName: "Test Theme",
        schemaVersion: 1,
        backgroundImage: "background.jpg",
      };

      await loader.loadTheme(theme, imageResolver);

      expect(imageResolver).toHaveBeenCalledWith("test", "background.jpg");

      const loaded = loader.getTheme("test");
      expect(loaded?.backgroundImage).toBe("/resolved/test/background.jpg");
    });

    it("should not resolve http:// URLs", async () => {
      const imageResolver = vi.fn(async (themeName: string, imagePath: string) => {
        return `/resolved/${themeName}/${imagePath}`;
      });

      const theme: Theme = {
        name: "test",
        displayName: "Test Theme",
        schemaVersion: 1,
        backgroundImage: "http://example.com/image.jpg",
      };

      await loader.loadTheme(theme, imageResolver);

      expect(imageResolver).not.toHaveBeenCalled();

      const loaded = loader.getTheme("test");
      expect(loaded?.backgroundImage).toBe("http://example.com/image.jpg");
    });

    it("should not resolve https:// URLs", async () => {
      const imageResolver = vi.fn(async (themeName: string, imagePath: string) => {
        return `/resolved/${themeName}/${imagePath}`;
      });

      const theme: Theme = {
        name: "test",
        displayName: "Test Theme",
        schemaVersion: 1,
        backgroundImage: "https://example.com/image.jpg",
      };

      await loader.loadTheme(theme, imageResolver);

      expect(imageResolver).not.toHaveBeenCalled();

      const loaded = loader.getTheme("test");
      expect(loaded?.backgroundImage).toBe("https://example.com/image.jpg");
    });

    it("should not resolve data: URLs", async () => {
      const imageResolver = vi.fn(async (themeName: string, imagePath: string) => {
        return `/resolved/${themeName}/${imagePath}`;
      });

      const theme: Theme = {
        name: "test",
        displayName: "Test Theme",
        schemaVersion: 1,
        backgroundImage:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      };

      await loader.loadTheme(theme, imageResolver);

      expect(imageResolver).not.toHaveBeenCalled();

      const loaded = loader.getTheme("test");
      expect(loaded?.backgroundImage).toContain("data:image/png");
    });

    it("should handle image resolver errors gracefully", async () => {
      const imageResolver = vi.fn(async () => {
        throw new Error("Failed to resolve image");
      });

      const theme: Theme = {
        name: "test",
        displayName: "Test Theme",
        schemaVersion: 1,
        backgroundImage: "background.jpg",
      };

      await loader.loadTheme(theme, imageResolver);

      const loaded = loader.getTheme("test");
      expect(loaded?.backgroundImage).toBeUndefined();
    });

    it("should not call imageResolver when no backgroundImage", async () => {
      const imageResolver = vi.fn(async (themeName: string, imagePath: string) => {
        return `/resolved/${themeName}/${imagePath}`;
      });

      const theme: Theme = {
        name: "test",
        displayName: "Test Theme",
        schemaVersion: 1,
      };

      await loader.loadTheme(theme, imageResolver);

      expect(imageResolver).not.toHaveBeenCalled();
    });
  });

  describe("initializeTheme", () => {
    it("should initialize theme without modifications when no inheritance or images", async () => {
      const theme: Theme = {
        name: "test",
        displayName: "Test Theme",
        schemaVersion: 1,
        colors: {
          background: "hsl(0 0% 100%)",
        },
      };

      const initialized = await loader.initializeTheme(theme);

      expect(initialized).toEqual(theme);
    });

    it("should initialize theme with inheritance", async () => {
      const parentTheme: Theme = {
        name: "parent",
        displayName: "Parent Theme",
        schemaVersion: 1,
        colors: {
          background: "hsl(0 0% 100%)",
        },
      };

      await loader.loadTheme(parentTheme);

      const childTheme: Theme = {
        name: "child",
        displayName: "Child Theme",
        schemaVersion: 1,
        inherits: "parent",
        colors: {
          foreground: "hsl(0 0% 0%)",
        },
      };

      const initialized = await loader.initializeTheme(childTheme);

      expect(initialized.colors?.background).toBe("hsl(0 0% 100%)");
      expect(initialized.colors?.foreground).toBe("hsl(0 0% 0%)");
    });

    it("should initialize theme with image resolution", async () => {
      const imageResolver = vi.fn(async (themeName: string, imagePath: string) => {
        return `/assets/${themeName}/${imagePath}`;
      });

      const theme: Theme = {
        name: "test",
        displayName: "Test Theme",
        schemaVersion: 1,
        backgroundImage: "bg.jpg",
      };

      const initialized = await loader.initializeTheme(theme, imageResolver);

      expect(initialized.backgroundImage).toBe("/assets/test/bg.jpg");
    });
  });

  describe("error handling", () => {
    it("should handle errors during theme loading gracefully", async () => {
      const corruptTheme = {
        name: "corrupt",
        displayName: "Corrupt Theme",
        schemaVersion: 1,
        get colors() {
          throw new Error("Property access error");
        },
      } as Theme;

      // Should not throw
      await expect(loader.loadTheme(corruptTheme)).resolves.toBeUndefined();
    });
  });
});
