import colorJson from './color.json' with { type: 'json' };
import darkJson from './dark.json' with { type: 'json' };
import lightJson from './light.json' with { type: 'json' };
import { validateTheme } from './theme-schema-validation.js';
import { applyTheme, applyThemeIsolated } from './theme.js';
import { Theme } from './theme.type.js';
export { ThemeProvider, useTheme } from './theme-context.js';
export type {
  ThemeChangeCallback,
  ThemeDiscoveryFunction,
} from './theme-context.js';
export type { ImageResolver } from './theme-loader.js';
export * from './theme.type.js';
export { applyTheme, applyThemeIsolated };
export const dark = darkJson as Theme;
export const light = lightJson as Theme;
export const color = colorJson as Theme;
export { validateTheme };
