import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Source alias so HMR works across packages without a build step
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@squiggle-line/react': resolve(import.meta.dirname, '../../packages/react/src/index.ts'),
      '@squiggle-line/core': resolve(import.meta.dirname, '../../packages/core/src/index.ts'),
    },
  },
});
