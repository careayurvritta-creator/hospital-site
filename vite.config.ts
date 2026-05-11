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
            // Group node_modules into vendor chunks
            if (id.includes('node_modules')) {
              // React core together
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
              // Everything else
              return 'vendor-misc';
            }
            // Pages into separate chunks
            if (id.includes('/pages/')) {
              const pageName = id.split('/pages/')[1]?.split('.')[0];
              return `page-${pageName}`;
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