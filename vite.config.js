import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-core': ['react', 'react-dom'],
          'three-core': ['three', 'cannon-es'],
          'state-and-motion': ['zustand', 'gsap']
        }
      }
    }
  },
  server: {
    host: true
  }
});
