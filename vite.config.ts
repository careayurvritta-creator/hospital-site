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
              // React and ReactDOM together
              if (id.includes('react') || id.includes('scheduler')) {
                return 'vendor-react';
              }
              // Icons
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              // Charts
              if (id.includes('recharts') || id.includes('d3-')) {
                return 'vendor-charts';
              }
              // AI SDK - this must be its OWN chunk to not block initial load
              if (id.includes('@google/genai')) {
                return 'vendor-ai';
              }
              // Everything else (including other deps)
              return 'vendor-misc';
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
      include: ['react', 'react-dom', 'react-router-dom'],
    },
  };
});