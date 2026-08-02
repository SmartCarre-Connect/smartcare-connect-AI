import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  base: process.env.VITE_BASE_URL || '/',

  server: {
    port: 5173,
    host: true,
    watch: {
      // Ignore Visual Studio workspace files which OneDrive or VS may lock
      ignored: ['**/.vs/**', '**/.git/**', '**/node_modules/**'],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
});