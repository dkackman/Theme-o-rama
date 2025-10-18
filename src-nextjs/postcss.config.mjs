/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // Disable @layer checking for imported CSS files
    'postcss-import': {
      skipDuplicates: false,
    },
  },
};

export default config;
