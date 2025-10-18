import type { Config } from 'tailwindcss';
// @ts-ignore - JS file without types
import { themeExtensions } from 'theme-o-rama/tailwind.config.js';

const config: Config = {
    darkMode: ['class'],
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            // Use theme-o-rama's Tailwind extensions directly
            ...themeExtensions,
        },
    },
    plugins: [],
};
export default config;

