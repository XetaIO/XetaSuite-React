import { defineConfig } from "vite";
import path from 'path';
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Build output configuration
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    proxy: {
      // Sanctum CSRF cookie (development only)
      '/sanctum': {
        target: 'https://xetasuite.test',
        changeOrigin: true,
        secure: false,
      },
      // API routes (development only)
      '/api': {
        target: 'https://xetasuite.test',
        changeOrigin: true,
        secure: false,
      }
    },
  },
});
