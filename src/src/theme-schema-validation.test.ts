import { describe, it, expect } from "vitest";
import { validateTheme } from "./theme-schema-validation";
import { Theme } from "./theme.type";

describe("validateTheme", () => {
  describe("valid themes", () => {
    it("should validate a minimal valid theme object", () => {
      const themeObj = {
        name: "test",
        displayName: "Test Theme",
        schemaVersion: 1,
      };

      const result = validateTheme(themeObj);

      expect(result).toEqual({
        ...themeObj,
        tags: [],
      });
    });

    it("should validate a complete theme object", () => {
      const themeObj: Theme = {
        name: "complete",
        displayName: "Complete Theme",
        schemaVersion: 1,
        mostLike: "light",
        tags: ["custom", "dark"],
        colors: {
          background: "hsl(0 0% 100%)",
          foreground: "hsl(0 0% 0%)",
        },
      };

      const result = validateTheme(themeObj);

      expect(result).toEqual(themeObj);
    });

    it("should validate a theme from JSON string", () => {
      const themeJson = JSON.stringify({
        name: "test",
        displayName: "Test Theme",
        schemaVersion: 1,
      });

      const result = validateTheme(themeJson);

      expect(result.name).toBe("test");
      expect(result.displayName).toBe("Test Theme");
      expect(result.schemaVersion).toBe(1);
    });

    it("should add empty tags array when not provided", () => {
      const themeObj = {
        name: "test",
        displayName: "Test Theme",
        schemaVersion: 1,
      };

      const result = validateTheme(themeObj);

      expect(result.tags).toEqual([]);
    });

    it("should preserve existing tags array", () => {
      const themeObj = {
        name: "test",
        displayName: "Test Theme",
        schemaVersion: 1,
        tags: ["custom", "blue"],
      };

      const result = validateTheme(themeObj);

      expect(result.tags).toEqual(["custom", "blue"]);
    });
  });

  describe("invalid JSON", () => {
    it("should throw error for invalid JSON string", () => {
      expect(() => {
        validateTheme("not valid json");
      }).toThrow("Invalid theme JSON structure. The theme string must be valid JSON");
    });

    it("should throw error for malformed JSON string", () => {
      expect(() => {
        validateTheme('{"name": "test", "displayName": }');
      }).toThrow("Invalid theme JSON structure. The theme string must be valid JSON");
    });
  });

  describe("invalid structure", () => {
    it("should throw error for null", () => {
      expect(() => {
        validateTheme(null);
      }).toThrow("Invalid theme JSON structure. The theme must be a valid JSON object");
    });

    it("should throw error for non-object types", () => {
      expect(() => {
        validateTheme(123);
      }).toThrow("Invalid theme JSON structure. The theme must be a valid JSON object");

      expect(() => {
        validateTheme(true);
      }).toThrow("Invalid theme JSON structure. The theme must be a valid JSON object");
    });

    it("should throw error for arrays", () => {
      // Arrays are objects in JS, so they pass the object check but fail on required fields
      expect(() => {
        validateTheme([]);
      }).toThrow("Invalid theme JSON structure. name is required");
    });
  });

  describe("missing required fields", () => {
    it("should throw error when name is missing", () => {
      const themeObj = {
        displayName: "Test Theme",
        schemaVersion: 1,
      };

      expect(() => {
        validateTheme(themeObj);
      }).toThrow("Invalid theme JSON structure. name is required");
    });

    it("should throw error when name is not a string", () => {
      const themeObj = {
        name: 123,
        displayName: "Test Theme",
        schemaVersion: 1,
      };

      expect(() => {
        validateTheme(themeObj);
      }).toThrow("Invalid theme JSON structure. name is required");
    });

    it("should throw error when displayName is missing", () => {
      const themeObj = {
        name: "test",
        schemaVersion: 1,
      };

      expect(() => {
        validateTheme(themeObj);
      }).toThrow("Invalid theme JSON structure. displayName is required");
    });

    it("should throw error when displayName is not a string", () => {
      const themeObj = {
        name: "test",
        displayName: 123,
        schemaVersion: 1,
      };

      expect(() => {
        validateTheme(themeObj);
      }).toThrow("Invalid theme JSON structure. displayName is required");
    });

    it("should throw error when schemaVersion is missing", () => {
      const themeObj = {
        name: "test",
        displayName: "Test Theme",
      };

      expect(() => {
        validateTheme(themeObj);
      }).toThrow("Invalid theme JSON structure. schemaVersion is required");
    });

    it("should throw error when schemaVersion is not a number", () => {
      const themeObj = {
        name: "test",
        displayName: "Test Theme",
        schemaVersion: "1",
      };

      expect(() => {
        validateTheme(themeObj);
      }).toThrow("Invalid theme JSON structure. schemaVersion is required");
    });
  });

  describe("invalid schemaVersion", () => {
    it("should throw error for unsupported schemaVersion", () => {
      const themeObj = {
        name: "test",
        displayName: "Test Theme",
        schemaVersion: 2,
      };

      expect(() => {
        validateTheme(themeObj);
      }).toThrow("Invalid theme JSON structure. Unrecognized schemaVersion: 2");
    });

    it("should throw error for schemaVersion 0", () => {
      const themeObj = {
        name: "test",
        displayName: "Test Theme",
        schemaVersion: 0,
      };

      expect(() => {
        validateTheme(themeObj);
      }).toThrow("Invalid theme JSON structure. Unrecognized schemaVersion: 0");
    });
  });

  describe("complex theme validation", () => {
    it("should validate theme with all optional properties", () => {
      const themeJson = JSON.stringify({
        name: "complex",
        displayName: "Complex Theme",
        schemaVersion: 1,
        mostLike: "dark",
        inherits: "dark",
        backgroundImage: "/bg.jpg",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        buttonStyle: "gradient",
        colors: {
          background: "hsl(0 0% 100%)",
          foreground: "hsl(0 0% 0%)",
          primary: "hsl(221 83% 53%)",
        },
        fonts: {
          sans: "Inter, sans-serif",
        },
        corners: {
          md: "0.375rem",
        },
        tags: ["custom", "complete"],
      });

      const result = validateTheme(themeJson);

      expect(result.name).toBe("complex");
      expect(result.mostLike).toBe("dark");
      expect(result.inherits).toBe("dark");
      expect(result.backgroundImage).toBe("/bg.jpg");
      expect(result.colors?.background).toBe("hsl(0 0% 100%)");
      expect(result.tags).toEqual(["custom", "complete"]);
    });
  });
});
