import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const localHqApiTarget = 'http://localhost:3000';

export default defineConfig({
  plugins: [react()],

  optimizeDeps: {
    exclude: ['lucide-react'],
  },

  server: {
    proxy: {
      // Local Vite dev talks directly to the HQ app. In production, the
      // ecommerce serverless proxy maps /api/early-access/* to
      // /api/public/early-access/*, so mirror only that mapping here.
      '/api/early-access': {
        target: localHqApiTarget,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/early-access/, '/api/public/early-access'),
      },
      '/api': {
        target: localHqApiTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});