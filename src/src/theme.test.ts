import { describe, it, expect, beforeEach } from "vitest";
import { applyTheme, applyThemeIsolated } from "./theme";
import { Theme } from "./theme.type";

describe("theme", () => {
  let mockRoot: HTMLElement;

  beforeEach(() => {
    // Create a fresh mock element for each test
    mockRoot = document.createElement("div");
    document.body.appendChild(mockRoot);
  });

  describe("applyTheme", () => {
    it("should apply basic theme properties", () => {
      const theme: Theme = {
        name: "test-theme",
        displayName: "Test Theme",
        schemaVersion: 1,
        mostLike: "light",
      };

      applyTheme(theme, mockRoot);

      expect(mockRoot.classList.contains("theme-test-theme")).toBe(true);
      expect(mockRoot.style.colorScheme).toBe("light");
    });

    it("should set color scheme to dark when mostLike is dark", () => {
      const theme: Theme = {
        name: "dark-theme",
        displayName: "Dark Theme",
        schemaVersion: 1,
        mostLike: "dark",
      };

      applyTheme(theme, mockRoot);

      expect(mockRoot.style.colorScheme).toBe("dark");
    });

    it("should apply color variables", () => {
      const theme: Theme = {
        name: "color-theme",
        displayName: "Color Theme",
        schemaVersion: 1,
        colors: {
          background: "hsl(0 0% 100%)",
          foreground: "hsl(0 0% 0%)",
          primary: "hsl(221 83% 53%)",
          primaryForeground: "hsl(0 0% 100%)",
        },
      };

      applyTheme(theme, mockRoot);

      expect(mockRoot.style.getPropertyValue("--background")).toBe("hsl(0 0% 100%)");
      expect(mockRoot.style.getPropertyValue("--foreground")).toBe("hsl(0 0% 0%)");
      expect(mockRoot.style.getPropertyValue("--primary")).toBe("hsl(221 83% 53%)");
      expect(mockRoot.style.getPropertyValue("--primary-foreground")).toBe("hsl(0 0% 100%)");
    });

    it("should apply font variables", () => {
      const theme: Theme = {
        name: "font-theme",
        displayName: "Font Theme",
        schemaVersion: 1,
        fonts: {
          sans: "Inter, sans-serif",
          serif: "Georgia, serif",
          mono: "Monaco, monospace",
          heading: "Poppins, sans-serif",
          body: "Inter, sans-serif",
        },
      };

      applyTheme(theme, mockRoot);

      expect(mockRoot.style.getPropertyValue("--font-sans")).toBe("Inter, sans-serif");
      expect(mockRoot.style.getPropertyValue("--font-serif")).toBe("Georgia, serif");
      expect(mockRoot.style.getPropertyValue("--font-mono")).toBe("Monaco, monospace");
      expect(mockRoot.style.getPropertyValue("--font-heading")).toBe("Poppins, sans-serif");
      expect(mockRoot.style.getPropertyValue("--font-body")).toBe("Inter, sans-serif");
    });

    it("should apply corner radius variables", () => {
      const theme: Theme = {
        name: "corners-theme",
        displayName: "Corners Theme",
        schemaVersion: 1,
        corners: {
          none: "0px",
          sm: "0.125rem",
          md: "0.375rem",
          lg: "0.5rem",
          xl: "0.75rem",
          full: "9999px",
        },
      };

      applyTheme(theme, mockRoot);

      expect(mockRoot.style.getPropertyValue("--corner-none")).toBe("0px");
      expect(mockRoot.style.getPropertyValue("--corner-sm")).toBe("0.125rem");
      expect(mockRoot.style.getPropertyValue("--corner-md")).toBe("0.375rem");
      expect(mockRoot.style.getPropertyValue("--corner-lg")).toBe("0.5rem");
      expect(mockRoot.style.getPropertyValue("--corner-xl")).toBe("0.75rem");
      expect(mockRoot.style.getPropertyValue("--corner-full")).toBe("9999px");
    });

    it("should apply shadow variables", () => {
      const theme: Theme = {
        name: "shadow-theme",
        displayName: "Shadow Theme",
        schemaVersion: 1,
        shadows: {
          none: "none",
          sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
          md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
        },
      };

      applyTheme(theme, mockRoot);

      expect(mockRoot.style.getPropertyValue("--shadow-none")).toBe("none");
      expect(mockRoot.style.getPropertyValue("--shadow-sm")).toBe("0 1px 2px 0 rgb(0 0 0 / 0.05)");
      expect(mockRoot.style.getPropertyValue("--shadow-md")).toBe(
        "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      );
      expect(mockRoot.style.getPropertyValue("--shadow-lg")).toBe(
        "0 10px 15px -3px rgb(0 0 0 / 0.1)",
      );
    });

    it("should apply background image with proper properties", () => {
      const theme: Theme = {
        name: "bg-theme",
        displayName: "Background Theme",
        schemaVersion: 1,
        backgroundImage: "/images/background.jpg",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };

      applyTheme(theme, mockRoot);

      // Browser normalizes url() by adding quotes and expands "center" to "center center"
      expect(mockRoot.style.backgroundImage).toBe('url("/images/background.jpg")');
      expect(mockRoot.style.backgroundSize).toBe("cover");
      expect(mockRoot.style.backgroundPosition).toBe("center center");
      expect(mockRoot.style.backgroundRepeat).toBe("no-repeat");
      expect(mockRoot.style.backgroundAttachment).toBe("fixed");
      expect(mockRoot.classList.contains("has-background-image")).toBe(true);
    });

    it("should remove background image when not specified", () => {
      // First apply a theme with background
      const themeWithBg: Theme = {
        name: "with-bg",
        displayName: "With Background",
        schemaVersion: 1,
        backgroundImage: "/images/bg.jpg",
      };
      applyTheme(themeWithBg, mockRoot);

      expect(mockRoot.classList.contains("has-background-image")).toBe(true);

      // Now apply a theme without background
      const themeWithoutBg: Theme = {
        name: "without-bg",
        displayName: "Without Background",
        schemaVersion: 1,
      };
      applyTheme(themeWithoutBg, mockRoot);

      expect(mockRoot.classList.contains("has-background-image")).toBe(false);
      expect(mockRoot.style.backgroundImage).toBe("");
    });

    it("should apply button style data attribute", () => {
      const theme: Theme = {
        name: "button-theme",
        displayName: "Button Theme",
        schemaVersion: 1,
        buttonStyle: "gradient",
      };

      applyTheme(theme, mockRoot);

      expect(mockRoot.getAttribute("data-theme-style")).toBe("gradient");
    });

    it("should set button style feature flags", () => {
      const theme: Theme = {
        name: "gradient-theme",
        displayName: "Gradient Theme",
        schemaVersion: 1,
        buttonStyle: "gradient",
      };

      applyTheme(theme, mockRoot);

      expect(mockRoot.style.getPropertyValue("--theme-has-gradient-buttons")).toBe("1");
      expect(mockRoot.style.getPropertyValue("--theme-has-shimmer-effects")).toBe("0");
    });

    it("should apply table variables", () => {
      const theme: Theme = {
        name: "table-theme",
        displayName: "Table Theme",
        schemaVersion: 1,
        tables: {
          background: "hsl(0 0% 100%)",
          border: "1px solid hsl(0 0% 89.8%)",
          header: {
            background: "hsl(0 0% 96.1%)",
            color: "hsl(0 0% 3.9%)",
            border: "1px solid hsl(0 0% 89.8%)",
          },
          row: {
            background: "hsl(0 0% 100%)",
            color: "hsl(0 0% 3.9%)",
            hover: {
              background: "hsl(0 0% 98%)",
              color: "hsl(0 0% 3.9%)",
            },
          },
        },
      };

      applyTheme(theme, mockRoot);

      expect(mockRoot.style.getPropertyValue("--table-background")).toBe("hsl(0 0% 100%)");
      expect(mockRoot.style.getPropertyValue("--table-border")).toBe("1px solid hsl(0 0% 89.8%)");
      expect(mockRoot.style.getPropertyValue("--table-header-background")).toBe("hsl(0 0% 96.1%)");
      expect(mockRoot.style.getPropertyValue("--table-row-hover-background")).toBe("hsl(0 0% 98%)");
    });

    it("should apply sidebar variables", () => {
      const theme: Theme = {
        name: "sidebar-theme",
        displayName: "Sidebar Theme",
        schemaVersion: 1,
        sidebar: {
          background: "hsl(0 0% 100%)",
          border: "1px solid hsl(0 0% 89.8%)",
          backdropFilter: "blur(10px)",
        },
      };

      applyTheme(theme, mockRoot);

      expect(mockRoot.style.getPropertyValue("--sidebar-background")).toBe("hsl(0 0% 100%)");
      expect(mockRoot.style.getPropertyValue("--sidebar-border")).toBe("1px solid hsl(0 0% 89.8%)");
      expect(mockRoot.style.getPropertyValue("--sidebar-backdrop-filter")).toBe("blur(10px)");
      expect(mockRoot.style.getPropertyValue("--sidebar-backdrop-filter-webkit")).toBe(
        "blur(10px)",
      );
    });

    it("should apply button variant variables", () => {
      const theme: Theme = {
        name: "btn-theme",
        displayName: "Button Theme",
        schemaVersion: 1,
        buttons: {
          default: {
            background: "hsl(0 0% 9%)",
            color: "hsl(0 0% 98%)",
            borderRadius: "0.375rem",
            hover: {
              background: "hsl(0 0% 15%)",
            },
          },
        },
      };

      applyTheme(theme, mockRoot);

      expect(mockRoot.style.getPropertyValue("--btn-default-background")).toBe("hsl(0 0% 9%)");
      expect(mockRoot.style.getPropertyValue("--btn-default-color")).toBe("hsl(0 0% 98%)");
      expect(mockRoot.style.getPropertyValue("--btn-default-radius")).toBe("0.375rem");
      expect(mockRoot.style.getPropertyValue("--btn-default-hover-background")).toBe(
        "hsl(0 0% 15%)",
      );
    });

    it("should apply switch variables", () => {
      const theme: Theme = {
        name: "switch-theme",
        displayName: "Switch Theme",
        schemaVersion: 1,
        switches: {
          checked: {
            background: "hsl(221 83% 53%)",
          },
          unchecked: {
            background: "hsl(0 0% 89.8%)",
          },
          thumb: {
            background: "hsl(0 0% 100%)",
          },
        },
      };

      applyTheme(theme, mockRoot);

      expect(mockRoot.style.getPropertyValue("--switch-checked-background")).toBe(
        "hsl(221 83% 53%)",
      );
      expect(mockRoot.style.getPropertyValue("--switch-unchecked-background")).toBe(
        "hsl(0 0% 89.8%)",
      );
      expect(mockRoot.style.getPropertyValue("--switch-thumb-background")).toBe("hsl(0 0% 100%)");
    });

    it("should apply backdrop filter variables", () => {
      const theme: Theme = {
        name: "backdrop-theme",
        displayName: "Backdrop Theme",
        schemaVersion: 1,
        colors: {
          cardBackdropFilter: "blur(10px)",
          popoverBackdropFilter: "blur(5px)",
          inputBackdropFilter: "blur(8px)",
        },
      };

      applyTheme(theme, mockRoot);

      expect(mockRoot.style.getPropertyValue("--card-backdrop-filter")).toBe("blur(10px)");
      expect(mockRoot.style.getPropertyValue("--popover-backdrop-filter")).toBe("blur(5px)");
      expect(mockRoot.style.getPropertyValue("--input-backdrop-filter")).toBe("blur(8px)");
    });

    it("should clear previous theme variables when applying new theme", () => {
      const theme1: Theme = {
        name: "theme1",
        displayName: "Theme 1",
        schemaVersion: 1,
        colors: {
          background: "hsl(0 0% 100%)",
          primary: "hsl(221 83% 53%)",
        },
      };

      applyTheme(theme1, mockRoot);

      expect(mockRoot.classList.contains("theme-theme1")).toBe(true);
      expect(mockRoot.style.getPropertyValue("--background")).toBe("hsl(0 0% 100%)");

      const theme2: Theme = {
        name: "theme2",
        displayName: "Theme 2",
        schemaVersion: 1,
        colors: {
          background: "hsl(0 0% 0%)",
        },
      };

      applyTheme(theme2, mockRoot);

      expect(mockRoot.classList.contains("theme-theme1")).toBe(false);
      expect(mockRoot.classList.contains("theme-theme2")).toBe(true);
      expect(mockRoot.style.getPropertyValue("--background")).toBe("hsl(0 0% 0%)");
    });

    it("should handle inputBackground color variable", () => {
      const theme: Theme = {
        name: "input-theme",
        displayName: "Input Theme",
        schemaVersion: 1,
        colors: {
          input: "hsl(0 0% 89.8%)",
          inputBackground: "hsl(0 0% 100%)",
        },
      };

      applyTheme(theme, mockRoot);

      expect(mockRoot.style.getPropertyValue("--input-background")).toBe("hsl(0 0% 100%)");
    });

    it("should fallback to input color when inputBackground is not specified", () => {
      const theme: Theme = {
        name: "input-fallback-theme",
        displayName: "Input Fallback Theme",
        schemaVersion: 1,
        colors: {
          input: "hsl(0 0% 89.8%)",
        },
      };

      applyTheme(theme, mockRoot);

      expect(mockRoot.style.getPropertyValue("--input-background")).toBe("hsl(0 0% 89.8%)");
    });

    it("should handle theme names with invalid characters gracefully", () => {
      const theme: Theme = {
        name: "theme with spaces!@#",
        displayName: "Invalid Name Theme",
        schemaVersion: 1,
      };

      applyTheme(theme, mockRoot);

      // Should add fallback class instead of crashing
      expect(mockRoot.classList.contains("theme-invalid-name")).toBe(true);
    });
  });

  describe("applyThemeIsolated", () => {
    it("should apply theme in isolated mode without background attachment", () => {
      const theme: Theme = {
        name: "isolated-theme",
        displayName: "Isolated Theme",
        schemaVersion: 1,
        backgroundImage: "/images/bg.jpg",
        colors: {
          background: "hsl(0 0% 100%)",
          foreground: "hsl(0 0% 0%)",
        },
      };

      applyThemeIsolated(theme, mockRoot);

      // Should have background image but not fixed attachment
      expect(mockRoot.style.backgroundImage).toBe('url("/images/bg.jpg")');
      expect(mockRoot.style.backgroundAttachment).not.toBe("fixed");
      expect(mockRoot.classList.contains("has-background-image")).toBe(true);
    });

    it("should set explicit background color in isolated mode", () => {
      const theme: Theme = {
        name: "isolated-bg",
        displayName: "Isolated Background",
        schemaVersion: 1,
        colors: {
          background: "hsl(0 0% 100%)",
          foreground: "hsl(0 0% 0%)",
        },
      };

      applyThemeIsolated(theme, mockRoot);

      // Browser normalizes HSL to RGB
      expect(mockRoot.style.backgroundColor).toBe("rgb(255, 255, 255)");
      expect(mockRoot.style.color).toBe("rgb(0, 0, 0)");
    });

    it("should set explicit font family in isolated mode", () => {
      const theme: Theme = {
        name: "isolated-font",
        displayName: "Isolated Font",
        schemaVersion: 1,
        fonts: {
          body: "Inter, sans-serif",
        },
      };

      applyThemeIsolated(theme, mockRoot);

      expect(mockRoot.style.fontFamily).toBe("Inter, sans-serif");
    });

    it("should fallback to sans font if body font not specified", () => {
      const theme: Theme = {
        name: "isolated-sans",
        displayName: "Isolated Sans",
        schemaVersion: 1,
        fonts: {
          sans: "Helvetica, sans-serif",
        },
      };

      applyThemeIsolated(theme, mockRoot);

      expect(mockRoot.style.fontFamily).toBe("Helvetica, sans-serif");
    });

    it("should apply Tailwind v4 color mappings in isolated mode", () => {
      const theme: Theme = {
        name: "tailwind-v4",
        displayName: "Tailwind v4",
        schemaVersion: 1,
        colors: {
          background: "hsl(0 0% 100%)",
          foreground: "hsl(0 0% 0%)",
          primary: "hsl(221 83% 53%)",
        },
      };

      applyThemeIsolated(theme, mockRoot);

      // Wait for next tick to allow getComputedStyle to work
      // In a real browser, these would be mapped
      expect(mockRoot.style.getPropertyValue("--background")).toBe("hsl(0 0% 100%)");
      expect(mockRoot.style.getPropertyValue("--primary")).toBe("hsl(221 83% 53%)");
    });

    it("should not apply document-wide background settings in isolated mode", () => {
      const theme: Theme = {
        name: "isolated-no-fixed",
        displayName: "Isolated No Fixed",
        schemaVersion: 1,
        backgroundImage: "/images/bg.jpg",
      };

      applyThemeIsolated(theme, mockRoot);

      // Should apply to element directly, not with fixed attachment
      expect(mockRoot.style.backgroundImage).toBe('url("/images/bg.jpg")');
      expect(mockRoot.style.backgroundAttachment).toBe("");
    });

    it("should clear previous theme classes in isolated mode", () => {
      const theme1: Theme = {
        name: "iso-theme1",
        displayName: "Isolated Theme 1",
        schemaVersion: 1,
      };

      applyThemeIsolated(theme1, mockRoot);
      expect(mockRoot.classList.contains("theme-iso-theme1")).toBe(true);

      const theme2: Theme = {
        name: "iso-theme2",
        displayName: "Isolated Theme 2",
        schemaVersion: 1,
      };

      applyThemeIsolated(theme2, mockRoot);
      expect(mockRoot.classList.contains("theme-iso-theme1")).toBe(false);
      expect(mockRoot.classList.contains("theme-iso-theme2")).toBe(true);
    });
  });

  describe("complex theme scenarios", () => {
    it("should handle complete theme with all properties", () => {
      const fullTheme: Theme = {
        name: "complete",
        displayName: "Complete Theme",
        schemaVersion: 1,
        mostLike: "light",
        backgroundImage: "/bg.jpg",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        buttonStyle: "gradient",
        colors: {
          background: "hsl(0 0% 100%)",
          foreground: "hsl(0 0% 0%)",
          primary: "hsl(221 83% 53%)",
          primaryForeground: "hsl(0 0% 100%)",
        },
        fonts: {
          sans: "Inter, sans-serif",
          body: "Inter, sans-serif",
        },
        corners: {
          md: "0.375rem",
          lg: "0.5rem",
        },
        shadows: {
          sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        },
        sidebar: {
          background: "hsl(0 0% 98%)",
        },
        tables: {
          background: "hsl(0 0% 100%)",
        },
        buttons: {
          default: {
            background: "hsl(0 0% 9%)",
            color: "hsl(0 0% 98%)",
          },
        },
        switches: {
          checked: {
            background: "hsl(221 83% 53%)",
          },
          unchecked: {
            background: "hsl(0 0% 89.8%)",
          },
        },
      };

      applyTheme(fullTheme, mockRoot);

      // Verify multiple aspects
      expect(mockRoot.classList.contains("theme-complete")).toBe(true);
      expect(mockRoot.style.colorScheme).toBe("light");
      expect(mockRoot.style.getPropertyValue("--background")).toBe("hsl(0 0% 100%)");
      expect(mockRoot.style.getPropertyValue("--font-sans")).toBe("Inter, sans-serif");
      expect(mockRoot.style.getPropertyValue("--corner-md")).toBe("0.375rem");
      expect(mockRoot.style.backgroundImage).toBe('url("/bg.jpg")');
    });

    it("should handle theme with partial properties", () => {
      const minimalTheme: Theme = {
        name: "minimal",
        displayName: "Minimal Theme",
        schemaVersion: 1,
      };

      applyTheme(minimalTheme, mockRoot);

      expect(mockRoot.classList.contains("theme-minimal")).toBe(true);
      // Should not crash with missing properties
    });
  });
});
