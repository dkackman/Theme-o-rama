/**
 * CSS Value Validation and Sanitization Utilities
 *
 * These utilities provide security by validating and sanitizing CSS values
 * before they are applied to the DOM, preventing CSS injection attacks.
 */

/**
 * Validates that a CSS color value is in a safe format
 * Accepts: hex colors, hsl(), rgb(), rgba(), hsla(), and named colors
 */
export function isValidCSSColor(value: unknown): boolean {
  if (typeof value !== "string") return false;

  const trimmed = value.trim();
  if (trimmed.length === 0) return false;

  // Hex colors: #RGB, #RRGGBB, #RRGGBBAA
  if (/^#[0-9A-Fa-f]{3,8}$/.test(trimmed)) return true;

  // HSL/HSLA: hsl(0, 0%, 0%), hsla(0, 0%, 0%, 0.5)
  if (/^hsla?\([^)]+\)$/.test(trimmed)) return true;

  // RGB/RGBA: rgb(0, 0, 0), rgba(0, 0, 0, 0.5)
  if (/^rgba?\([^)]+\)$/.test(trimmed)) return true;

  // Named colors (basic set - extend as needed)
  const namedColors = [
    'transparent', 'currentcolor', 'inherit', 'initial', 'unset',
    'black', 'white', 'red', 'green', 'blue', 'yellow', 'orange',
    'purple', 'pink', 'brown', 'gray', 'grey'
  ];
  if (namedColors.includes(trimmed.toLowerCase())) return true;

  return false;
}

/**
 * Validates that a URL is safe for use in CSS
 * Prevents data: URLs with non-image content and javascript: URLs
 */
export function isValidCSSUrl(value: unknown): boolean {
  if (typeof value !== "string") return false;

  const trimmed = value.trim();
  if (trimmed.length === 0) return false;

  // Block javascript: URLs
  if (trimmed.toLowerCase().startsWith('javascript:')) return false;

  // Block data: URLs that aren't images
  if (trimmed.toLowerCase().startsWith('data:')) {
    return /^data:image\/(png|jpg|jpeg|gif|svg\+xml|webp);base64,/.test(trimmed.toLowerCase());
  }

  // Allow http(s) URLs
  if (/^https?:\/\//.test(trimmed)) return true;

  // Allow relative paths (but validate they don't contain suspicious characters)
  if (/^[a-zA-Z0-9\/_.\-]+$/.test(trimmed)) return true;

  return false;
}

/**
 * Validates that a font family string is safe
 */
export function isValidCSSFont(value: unknown): boolean {
  if (typeof value !== "string") return false;

  const trimmed = value.trim();
  if (trimmed.length === 0) return false;

  // Allow font names with letters, numbers, spaces, hyphens, and commas
  // This covers most legitimate font families like "Arial, sans-serif"
  return /^[a-zA-Z0-9\s\-,']+$/.test(trimmed);
}

/**
 * Validates CSS size/length values
 * Accepts: px, rem, em, %, vh, vw, etc.
 */
export function isValidCSSSize(value: unknown): boolean {
  if (typeof value !== "string") return false;

  const trimmed = value.trim();
  if (trimmed.length === 0) return false;

  // Allow numeric values with units
  if (/^-?\d+(\.\d+)?(px|rem|em|%|vh|vw|vmin|vmax|ch|ex)$/.test(trimmed)) return true;

  // Allow 0 without unit
  if (trimmed === '0') return true;

  // Allow calc() expressions (basic validation)
  if (/^calc\([^)]+\)$/.test(trimmed)) return true;

  // Allow common keywords
  const keywords = ['auto', 'inherit', 'initial', 'unset', 'none'];
  if (keywords.includes(trimmed.toLowerCase())) return true;

  return false;
}

/**
 * Validates CSS shadow values
 * Accepts: shadow definitions like "0 1px 2px rgba(0,0,0,0.1)"
 */
export function isValidCSSShadow(value: unknown): boolean {
  if (typeof value !== "string") return false;

  const trimmed = value.trim();
  if (trimmed.length === 0) return false;

  // Allow "none"
  if (trimmed.toLowerCase() === 'none') return true;

  // Allow shadow syntax: numbers, units, colors, and commas
  // This is a basic check - full validation would be complex
  // Allow forward slashes for modern CSS color syntax like rgb(0 0 0 / 0.1)
  return /^[\d\s.px\-remem()rgba,#/]+$/.test(trimmed);
}

/**
 * Validates CSS border values
 */
export function isValidCSSBorder(value: unknown): boolean {
  if (typeof value !== "string") return false;

  const trimmed = value.trim();
  if (trimmed.length === 0) return false;

  // Allow "none"
  if (trimmed.toLowerCase() === 'none') return true;

  // Allow border syntax: width style color
  // Examples: "1px solid #000", "2px dashed rgba(0,0,0,0.5)"
  return /^[\d\s.px\-remem()rgba,#a-z]+$/.test(trimmed.toLowerCase());
}

/**
 * Validates backdrop-filter values
 */
export function isValidCSSBackdropFilter(value: unknown): boolean {
  if (typeof value !== "string") return false;

  const trimmed = value.trim();
  if (trimmed.length === 0) return false;

  // Allow "none"
  if (trimmed.toLowerCase() === 'none') return true;

  // Allow filter functions: blur(), brightness(), etc.
  // This is a basic check
  return /^(blur|brightness|contrast|grayscale|hue-rotate|invert|opacity|saturate|sepia)\([^)]+\)(\s+(blur|brightness|contrast|grayscale|hue-rotate|invert|opacity|saturate|sepia)\([^)]+\))*$/.test(trimmed);
}

/**
 * Sanitizes a CSS URL by ensuring proper escaping
 */
export function sanitizeCSSUrl(url: string): string {
  if (!isValidCSSUrl(url)) {
    throw new Error(`Invalid CSS URL: ${url}`);
  }

  // Escape quotes and backslashes
  return url
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'");
}

/**
 * Generic CSS value validator that checks for injection attempts
 */
export function isValidCSSValue(value: unknown): boolean {
  if (typeof value !== "string") return false;

  const trimmed = value.trim();
  if (trimmed.length === 0) return false;

  // Block semicolons, quotes, and other injection characters
  if (/[;"'<>{}]/.test(trimmed)) return false;

  return true;
}
