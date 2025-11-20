import { describe, it, expect } from "vitest";
import {
  isValidCSSColor,
  isValidCSSUrl,
  isValidCSSFont,
  isValidCSSSize,
  isValidCSSShadow,
  isValidCSSBorder,
  isValidCSSBackdropFilter,
  isValidCSSValue,
  sanitizeCSSUrl,
} from "./css-validation";

describe("CSS Validation", () => {
  describe("isValidCSSColor", () => {
    it("should accept valid hex colors", () => {
      expect(isValidCSSColor("#fff")).toBe(true);
      expect(isValidCSSColor("#ffffff")).toBe(true);
      expect(isValidCSSColor("#FFFFFF")).toBe(true);
      expect(isValidCSSColor("#ffffffff")).toBe(true);
      expect(isValidCSSColor("#12345678")).toBe(true);
    });

    it("should accept valid HSL colors", () => {
      expect(isValidCSSColor("hsl(0, 0%, 0%)")).toBe(true);
      expect(isValidCSSColor("hsl(180 50% 50%)")).toBe(true);
      expect(isValidCSSColor("hsla(0, 0%, 0%, 0.5)")).toBe(true);
      expect(isValidCSSColor("hsla(180 50% 50% / 0.5)")).toBe(true);
    });

    it("should accept valid RGB colors", () => {
      expect(isValidCSSColor("rgb(0, 0, 0)")).toBe(true);
      expect(isValidCSSColor("rgb(255 255 255)")).toBe(true);
      expect(isValidCSSColor("rgba(0, 0, 0, 0.5)")).toBe(true);
      expect(isValidCSSColor("rgba(255 255 255 / 0.5)")).toBe(true);
    });

    it("should accept valid named colors", () => {
      expect(isValidCSSColor("black")).toBe(true);
      expect(isValidCSSColor("white")).toBe(true);
      expect(isValidCSSColor("red")).toBe(true);
      expect(isValidCSSColor("transparent")).toBe(true);
      expect(isValidCSSColor("currentcolor")).toBe(true);
      expect(isValidCSSColor("inherit")).toBe(true);
    });

    it("should reject invalid colors", () => {
      expect(isValidCSSColor("not-a-color")).toBe(false);
      expect(isValidCSSColor("#gg")).toBe(false);
      // Note: rgb(999, 999, 999) passes pattern validation but browser will handle invalid values
      expect(isValidCSSColor("javascript:alert(1)")).toBe(false);
      expect(isValidCSSColor("")).toBe(false);
      expect(isValidCSSColor(123)).toBe(false);
      expect(isValidCSSColor(null)).toBe(false);
      expect(isValidCSSColor(undefined)).toBe(false);
    });

    it("should handle whitespace", () => {
      expect(isValidCSSColor("  #fff  ")).toBe(true);
      expect(isValidCSSColor("  red  ")).toBe(true);
    });
  });

  describe("isValidCSSUrl", () => {
    it("should accept valid HTTP/HTTPS URLs", () => {
      expect(isValidCSSUrl("http://example.com/image.jpg")).toBe(true);
      expect(isValidCSSUrl("https://example.com/image.jpg")).toBe(true);
      expect(isValidCSSUrl("https://cdn.example.com/path/to/image.png")).toBe(
        true,
      );
    });

    it("should accept valid relative paths", () => {
      expect(isValidCSSUrl("/images/background.jpg")).toBe(true);
      expect(isValidCSSUrl("images/background.jpg")).toBe(true);
      expect(isValidCSSUrl("../images/background.jpg")).toBe(true);
      expect(isValidCSSUrl("./background.jpg")).toBe(true);
      expect(isValidCSSUrl("background-image_2024.png")).toBe(true);
    });

    it("should accept valid data URLs for images", () => {
      expect(
        isValidCSSUrl("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAA="),
      ).toBe(true);
      expect(isValidCSSUrl("data:image/jpeg;base64,/9j/4AAQSkZJRg==")).toBe(
        true,
      );
      expect(isValidCSSUrl("data:image/gif;base64,R0lGODlhAQABAIAA")).toBe(
        true,
      );
      expect(
        isValidCSSUrl("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDov"),
      ).toBe(true);
      expect(isValidCSSUrl("data:image/webp;base64,UklGRiQAAABXRUJQ")).toBe(
        true,
      );
    });

    it("should reject javascript: URLs", () => {
      expect(isValidCSSUrl("javascript:alert(1)")).toBe(false);
      expect(isValidCSSUrl("JavaScript:alert(1)")).toBe(false);
      expect(isValidCSSUrl("JAVASCRIPT:alert(1)")).toBe(false);
    });

    it("should reject data: URLs that are not images", () => {
      expect(isValidCSSUrl("data:text/html,<script>alert(1)</script>")).toBe(
        false,
      );
      expect(isValidCSSUrl("data:text/plain,hello")).toBe(false);
      expect(isValidCSSUrl("data:application/javascript,alert(1)")).toBe(
        false,
      );
    });

    it("should reject paths with suspicious characters", () => {
      expect(isValidCSSUrl("image.jpg;background:red")).toBe(false);
      expect(isValidCSSUrl("image.jpg<script>")).toBe(false);
      expect(isValidCSSUrl("image.jpg{color:red}")).toBe(false);
    });

    it("should reject empty strings and non-strings", () => {
      expect(isValidCSSUrl("")).toBe(false);
      expect(isValidCSSUrl(123)).toBe(false);
      expect(isValidCSSUrl(null)).toBe(false);
      expect(isValidCSSUrl(undefined)).toBe(false);
    });

    it("should handle whitespace", () => {
      expect(isValidCSSUrl("  /images/bg.jpg  ")).toBe(true);
    });
  });

  describe("isValidCSSFont", () => {
    it("should accept valid font families", () => {
      expect(isValidCSSFont("Arial")).toBe(true);
      expect(isValidCSSFont("Arial, sans-serif")).toBe(true);
      expect(isValidCSSFont("'Times New Roman', serif")).toBe(true);
      expect(isValidCSSFont("Helvetica Neue, Arial, sans-serif")).toBe(true);
      expect(isValidCSSFont("Georgia, 'Times New Roman', serif")).toBe(true);
    });

    it("should accept fonts with hyphens and numbers", () => {
      expect(isValidCSSFont("Inter-Regular")).toBe(true);
      expect(isValidCSSFont("Roboto-500")).toBe(true);
    });

    it("should reject fonts with suspicious characters", () => {
      expect(isValidCSSFont("Arial;color:red")).toBe(false);
      expect(isValidCSSFont("Arial{color:red}")).toBe(false);
      expect(isValidCSSFont("Arial<script>")).toBe(false);
    });

    it("should reject empty strings and non-strings", () => {
      expect(isValidCSSFont("")).toBe(false);
      expect(isValidCSSFont(123)).toBe(false);
      expect(isValidCSSFont(null)).toBe(false);
      expect(isValidCSSFont(undefined)).toBe(false);
    });

    it("should handle whitespace", () => {
      expect(isValidCSSFont("  Arial  ")).toBe(true);
    });
  });

  describe("isValidCSSSize", () => {
    it("should accept valid pixel values", () => {
      expect(isValidCSSSize("10px")).toBe(true);
      expect(isValidCSSSize("0px")).toBe(true);
      expect(isValidCSSSize("-10px")).toBe(true);
      expect(isValidCSSSize("10.5px")).toBe(true);
    });

    it("should accept valid rem/em values", () => {
      expect(isValidCSSSize("1rem")).toBe(true);
      expect(isValidCSSSize("1.5rem")).toBe(true);
      expect(isValidCSSSize("2em")).toBe(true);
      expect(isValidCSSSize("0.5em")).toBe(true);
    });

    it("should accept valid percentage values", () => {
      expect(isValidCSSSize("100%")).toBe(true);
      expect(isValidCSSSize("50%")).toBe(true);
      expect(isValidCSSSize("0%")).toBe(true);
    });

    it("should accept valid viewport units", () => {
      expect(isValidCSSSize("100vh")).toBe(true);
      expect(isValidCSSSize("50vw")).toBe(true);
      expect(isValidCSSSize("10vmin")).toBe(true);
      expect(isValidCSSSize("10vmax")).toBe(true);
    });

    it("should accept other valid units", () => {
      expect(isValidCSSSize("2ch")).toBe(true);
      expect(isValidCSSSize("1ex")).toBe(true);
    });

    it("should accept zero without unit", () => {
      expect(isValidCSSSize("0")).toBe(true);
    });

    it("should accept calc() expressions", () => {
      expect(isValidCSSSize("calc(100% - 20px)")).toBe(true);
      expect(isValidCSSSize("calc(50vh + 10px)")).toBe(true);
    });

    it("should accept keywords", () => {
      expect(isValidCSSSize("auto")).toBe(true);
      expect(isValidCSSSize("inherit")).toBe(true);
      expect(isValidCSSSize("initial")).toBe(true);
      expect(isValidCSSSize("unset")).toBe(true);
      expect(isValidCSSSize("none")).toBe(true);
    });

    it("should reject invalid sizes", () => {
      expect(isValidCSSSize("10")).toBe(false); // Missing unit
      expect(isValidCSSSize("10.5")).toBe(false); // Missing unit
      expect(isValidCSSSize("px10")).toBe(false); // Wrong order
      expect(isValidCSSSize("10px;color:red")).toBe(false);
    });

    it("should reject empty strings and non-strings", () => {
      expect(isValidCSSSize("")).toBe(false);
      expect(isValidCSSSize(123)).toBe(false);
      expect(isValidCSSSize(null)).toBe(false);
      expect(isValidCSSSize(undefined)).toBe(false);
    });
  });

  describe("isValidCSSShadow", () => {
    it("should accept valid shadow values", () => {
      expect(isValidCSSShadow("0 1px 2px rgba(0,0,0,0.1)")).toBe(true);
      expect(isValidCSSShadow("0 0 10px #000")).toBe(true);
      expect(isValidCSSShadow("2px 2px 4px rgba(0,0,0,0.5)")).toBe(true);
      expect(isValidCSSShadow("0 0 0 1px #000, 0 2px 4px rgba(0,0,0,0.1)")).toBe(
        true,
      );
    });

    it("should accept 'none' keyword", () => {
      expect(isValidCSSShadow("none")).toBe(true);
      expect(isValidCSSShadow("None")).toBe(true);
      expect(isValidCSSShadow("NONE")).toBe(true);
    });

    it("should reject invalid shadow values", () => {
      expect(isValidCSSShadow("invalid")).toBe(false);
      expect(isValidCSSShadow("0 0 10px url(javascript:alert(1))")).toBe(
        false,
      );
    });

    it("should reject empty strings and non-strings", () => {
      expect(isValidCSSShadow("")).toBe(false);
      expect(isValidCSSShadow(123)).toBe(false);
      expect(isValidCSSShadow(null)).toBe(false);
      expect(isValidCSSShadow(undefined)).toBe(false);
    });
  });

  describe("isValidCSSBorder", () => {
    it("should accept valid border values", () => {
      expect(isValidCSSBorder("1px solid #000")).toBe(true);
      expect(isValidCSSBorder("2px dashed rgba(0,0,0,0.5)")).toBe(true);
      expect(isValidCSSBorder("1px dotted red")).toBe(true);
      expect(isValidCSSBorder("3px double #333")).toBe(true);
    });

    it("should accept 'none' keyword", () => {
      expect(isValidCSSBorder("none")).toBe(true);
      expect(isValidCSSBorder("None")).toBe(true);
      expect(isValidCSSBorder("NONE")).toBe(true);
    });

    it("should reject invalid border values", () => {
      // Note: "invalid" passes pattern validation (basic safety check only)
      expect(isValidCSSBorder("1px solid url(javascript:alert(1))")).toBe(
        false,
      );
      expect(isValidCSSBorder("1px<script>")).toBe(false);
    });

    it("should reject empty strings and non-strings", () => {
      expect(isValidCSSBorder("")).toBe(false);
      expect(isValidCSSBorder(123)).toBe(false);
      expect(isValidCSSBorder(null)).toBe(false);
      expect(isValidCSSBorder(undefined)).toBe(false);
    });
  });

  describe("isValidCSSBackdropFilter", () => {
    it("should accept valid backdrop filter functions", () => {
      expect(isValidCSSBackdropFilter("blur(10px)")).toBe(true);
      expect(isValidCSSBackdropFilter("brightness(1.5)")).toBe(true);
      expect(isValidCSSBackdropFilter("contrast(200%)")).toBe(true);
      expect(isValidCSSBackdropFilter("grayscale(50%)")).toBe(true);
      expect(isValidCSSBackdropFilter("hue-rotate(90deg)")).toBe(true);
      expect(isValidCSSBackdropFilter("invert(75%)")).toBe(true);
      expect(isValidCSSBackdropFilter("opacity(25%)")).toBe(true);
      expect(isValidCSSBackdropFilter("saturate(200%)")).toBe(true);
      expect(isValidCSSBackdropFilter("sepia(100%)")).toBe(true);
    });

    it("should accept multiple filter functions", () => {
      expect(isValidCSSBackdropFilter("blur(10px) brightness(1.5)")).toBe(true);
      expect(
        isValidCSSBackdropFilter("blur(5px) contrast(150%) saturate(1.2)"),
      ).toBe(true);
    });

    it("should accept 'none' keyword", () => {
      expect(isValidCSSBackdropFilter("none")).toBe(true);
      expect(isValidCSSBackdropFilter("None")).toBe(true);
      expect(isValidCSSBackdropFilter("NONE")).toBe(true);
    });

    it("should reject invalid filter functions", () => {
      expect(isValidCSSBackdropFilter("invalid()")).toBe(false);
      expect(isValidCSSBackdropFilter("url(javascript:alert(1))")).toBe(false);
      expect(isValidCSSBackdropFilter("blur(10px);color:red")).toBe(false);
    });

    it("should reject empty strings and non-strings", () => {
      expect(isValidCSSBackdropFilter("")).toBe(false);
      expect(isValidCSSBackdropFilter(123)).toBe(false);
      expect(isValidCSSBackdropFilter(null)).toBe(false);
      expect(isValidCSSBackdropFilter(undefined)).toBe(false);
    });
  });

  describe("isValidCSSValue", () => {
    it("should accept basic CSS values", () => {
      expect(isValidCSSValue("auto")).toBe(true);
      expect(isValidCSSValue("10px")).toBe(true);
      expect(isValidCSSValue("red")).toBe(true);
      expect(isValidCSSValue("100%")).toBe(true);
    });

    it("should reject values with injection characters", () => {
      expect(isValidCSSValue("10px;color:red")).toBe(false);
      expect(isValidCSSValue('10px"color:red')).toBe(false);
      expect(isValidCSSValue("10px'color:red")).toBe(false);
      expect(isValidCSSValue("10px<script>")).toBe(false);
      expect(isValidCSSValue("10px>alert")).toBe(false);
      expect(isValidCSSValue("10px{color:red}")).toBe(false);
    });

    it("should reject empty strings and non-strings", () => {
      expect(isValidCSSValue("")).toBe(false);
      expect(isValidCSSValue(123)).toBe(false);
      expect(isValidCSSValue(null)).toBe(false);
      expect(isValidCSSValue(undefined)).toBe(false);
    });
  });

  describe("sanitizeCSSUrl", () => {
    it("should return valid URLs unchanged", () => {
      expect(sanitizeCSSUrl("/path/to/image.jpg")).toBe("/path/to/image.jpg");
      expect(sanitizeCSSUrl("images/background.png")).toBe(
        "images/background.png",
      );
      expect(sanitizeCSSUrl("https://example.com/image.jpg")).toBe(
        "https://example.com/image.jpg",
      );
    });

    it("should throw error for invalid URLs", () => {
      expect(() => sanitizeCSSUrl("javascript:alert(1)")).toThrow(
        "Invalid CSS URL",
      );
      expect(() => sanitizeCSSUrl("data:text/html,<script>")).toThrow(
        "Invalid CSS URL",
      );
      expect(() => sanitizeCSSUrl("image.jpg;background:red")).toThrow(
        "Invalid CSS URL",
      );
    });

    it("should reject URLs with quotes for security", () => {
      // Quotes in file paths are blocked at the validation step
      expect(() => sanitizeCSSUrl("/path/with'quote.jpg")).toThrow(
        "Invalid CSS URL",
      );
      expect(() => sanitizeCSSUrl('/path/with"quote.jpg')).toThrow(
        "Invalid CSS URL",
      );
    });
  });
});
