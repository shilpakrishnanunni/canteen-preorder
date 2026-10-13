import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Forward API requests to Spring so the browser never hits a CORS problem.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/menu': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/orders': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
