import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  resolve: {
    alias: {
      '@squiggle-line/core': resolve(import.meta.dirname, '../../packages/core/src/index.ts'),
    },
  },
  build: {
    target: 'es6',
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
    emptyOutDir: false,
    rollupOptions: {
      input: {
        ui: resolve(import.meta.dirname, 'index.html'),
      },
      output: {
        entryFileNames: 'ui.js',
      },
    },
  },
});
