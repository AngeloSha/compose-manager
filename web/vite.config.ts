import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '^/(files|file|merge)': {
        target: 'http://localhost:8686',
        changeOrigin: true
      }
    }
  },
  build: { outDir: 'dist' }
});

