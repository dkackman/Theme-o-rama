import darkJson from './dark.json';
import lightJson from './light.json';
import schema from './schema.json';
import { applyTheme, applyThemeIsolated } from './theme';
import { Theme } from './theme.type';

export * from './theme.type';
export { schema };
export const dark = darkJson as Theme;
export const light = lightJson as Theme;
export { applyTheme, applyThemeIsolated };
