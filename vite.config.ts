import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    root: '.',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    build: {
      outDir: 'dist',
      minify: 'esbuild',
      target: 'esnext',
    },
    envPrefix: 'VITE_',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './tests/setup.ts',
      include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    },
  };
});