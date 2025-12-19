import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  define: {
    // Shims process.env to allow code to run in both AI Studio and standard Vite builds
    'process.env': {
      API_KEY: JSON.stringify(process.env.API_KEY || '')
    },
  },
});