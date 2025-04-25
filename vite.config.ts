import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
<<<<<<< HEAD
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
=======
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
>>>>>>> parent of 3b4db05 (PDE 0.1.7.2)

export default defineConfig({
  plugins: [react()],
  root: 'client',
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
<<<<<<< HEAD
  build: {
    outDir: '../dist',
=======
  root: path.resolve(import.meta.dirname, "client"),
  build: {
<<<<<<< HEAD
<<<<<<< HEAD
    outDir: path.resolve(import.meta.dirname, "dist/client"),
>>>>>>> parent of 3b4db05 (PDE 0.1.7.2)
=======
    outDir: path.resolve(import.meta.dirname, "dist/public"),
>>>>>>> parent of 32d4353 (PDE V0.1.7.1)
=======
    outDir: path.resolve(import.meta.dirname, "dist/public"),
>>>>>>> parent of 32d4353 (PDE V0.1.7.1)
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
<<<<<<< HEAD
  server: {
    port: 3000,
    host: true
  }
=======
>>>>>>> parent of 3b4db05 (PDE 0.1.7.2)
});
