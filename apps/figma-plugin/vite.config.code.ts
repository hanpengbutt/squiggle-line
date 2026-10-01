import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    target: 'es6',
    emptyOutDir: false,
    lib: {
      entry: resolve(import.meta.dirname, 'src/plugin/code.ts'),
      name: 'code',
      formats: ['cjs'],
      fileName: () => 'code.js',
    },
    rollupOptions: {
      output: {
        entryFileNames: 'code.js',
      },
    },
  },
});
