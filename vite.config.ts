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
          // Simple vendor chunking only - no page splitting to avoid Vercel issues
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
              // Everything else (including AI SDK, Sentry, etc.)
              return 'vendor-misc';
            }
            // No page-based chunking - pages stay in main bundle
            // This avoids React.lazy() issues on Vercel
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