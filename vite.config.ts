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
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              // Charts - load separately for better caching
              if (id.includes('recharts') || id.includes('d3-')) {
                return 'vendor-charts';
              }
              // AI SDK - load separately to not block initial render
              if (id.includes('@google/generative-ai') || id.includes('@google/genai')) {
                return 'vendor-ai';
              }
            }
          },
        },
      },
    },
    envPrefix: 'VITE_',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'lucide-react'],
    },
  };
});