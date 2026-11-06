import { defineConfig } from 'vite';

// GitHub project pages are served from /<repo>/, so CI passes VITE_BASE=/Vicon/.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  build: { outDir: '../site', emptyOutDir: true },
});
