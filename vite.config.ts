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
      rollupOptions: {
        input: './index.tsx',
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('react-dom') || id.includes('react/')) {
                return 'vendor-react';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-ui';
              }
              if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) {
                return 'vendor-charts';
              }
              if (id.includes('@sentry')) {
                return 'vendor-sentry';
              }
              if (id.includes('@google/genai')) {
                return 'vendor-ai';
              }
              return 'vendor-misc';
            }
            if (id.includes('/pages/')) {
              const pageName = id.split('/pages/')[1]?.split('.')[0];
              return `page-${pageName}`;
            }
          },
        },
      },
      cssCodeSplit: true,
      minify: 'esbuild',
      target: 'es2020',
      chunkSizeWarningLimit: 500,
      sourcemap: false,
      manifest: true,
    },
    envPrefix: 'VITE_',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      exclude: ['@sentry/react'],
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './tests/setup.ts',
      include: ['tests/**/*.{test,spec}.{ts,tsx}'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'tests/',
          '**/*.d.ts',
          '**/*.config.*',
          'dist/',
        ],
      },
    },
  };
});