/* eslint-env node */
const js = require("@eslint/js");
const typescriptEslint = require("typescript-eslint");
const react = require("eslint-plugin-react");

module.exports = [
  js.configs.recommended,
  ...typescriptEslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      react,
    },
    languageOptions: {
      parser: typescriptEslint.parser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "react/react-in-jsx-scope": "off", // Not needed in React 17+
      "react/prop-types": "off", // Using TypeScript for prop validation
    },
  },
  {
    ignores: ["dist", "node_modules", "*.config.js", "eslint.config.cjs"],
  },
];
