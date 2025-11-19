import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Use jsdom environment for React component testing
    environment: "jsdom",

    // Global test APIs (describe, it, expect, etc.) without imports
    globals: true,

    // Setup files to run before each test file
    setupFiles: ["./src/test-setup.ts"],

    // Test file patterns
    include: ["src/**/*.{test,spec}.{ts,tsx}"],

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.{test,spec}.{ts,tsx}",
        "src/test-setup.ts",
        "src/**/*.d.ts",
        "src/index.ts", // Entry point, mostly re-exports
      ],
    },
  },
});
