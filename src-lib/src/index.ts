import colorJson from './color.json';
import darkJson from './dark.json';
import lightJson from './light.json';
import { applyTheme, applyThemeIsolated } from './theme';
import { validateTheme } from './theme-schema-validation';
import { Theme } from './theme.type';
export { ThemeProvider, useTheme } from './theme-context';
export type {
  ThemeChangeCallback,
  ThemeDiscoveryFunction,
} from './theme-context';
export type { ImageResolver } from './theme-loader';
export * from './theme.type';
export { applyTheme, applyThemeIsolated };
export const dark = darkJson as Theme;
export const light = lightJson as Theme;
export const color = colorJson as Theme;
export { validateTheme };
