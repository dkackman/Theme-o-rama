import darkJson from './dark.json';
import lightJson from './light.json';
import schema from './schema.json';
import { Theme } from './theme.type';

// Main entry point for the theme-o-rama library
export * from './theme.type';
export { schema };
export const dark = darkJson as Theme;
export const light = lightJson as Theme;
