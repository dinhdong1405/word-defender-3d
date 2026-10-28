import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.GITHUB_ACTIONS === 'true' ? '/word-defender-3d/' : '/',
  plugins: [react()],
  server: {
    fs: {
      strict: false,
    },
  },
  resolve: {
    // Keep the project-facing paths for OneDrive-backed junctions. Otherwise
    // Vite treats src as external and serves raw TSX in dev mode.
    preserveSymlinks: true,
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
  },
} as any);
