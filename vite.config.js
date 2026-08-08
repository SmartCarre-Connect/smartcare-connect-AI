import { defineConfig } from 'vite';

// Ignore IDE and other heavy folders when watching in development (OneDrive/.vs can cause EBUSY)
export default defineConfig({
  server: {
    watch: {
      ignored: ['**/.vs/**', '**/.git/**', '**/node_modules/**']
    }
  }
});
