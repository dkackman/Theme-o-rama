import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';

// Web-specific Vite configuration
export default defineConfig({
  base: './', // Use relative paths for GitHub Pages
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 3000,
    strictPort: true,
    host: true,
  },
  preview: {
    port: 4174,
    strictPort: true,
    host: true,
  },
  build: {
    outDir: 'dist-web',
    chunkSizeWarningLimit: 2048,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
          ],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    // Define environment variables for web build
    __TAURI__: false,
  },
});
