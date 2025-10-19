import { themeExtensions } from 'theme-o-rama/tailwind.config.js';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['src/**/*.{ts,tsx}', 'index.html'],
  theme: {
    extend: {
      // Theme-o-rama theme extensions
      ...themeExtensions,

      // App-specific extensions
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
