import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],

  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND || 'http://localhost:8088', // Your backend API URL
        changeOrigin: true, // Changes the origin of the host header to the target URL
        secure: false, // Allows HTTPS requests even with self-signed certificates (for development)
      },
    },
  },
});
