import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

const backend = process.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": { target: backend, changeOrigin: true },
      "/media": { target: backend, changeOrigin: true },
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: { enabled: false },
      workbox: {
        navigateFallbackDenylist: [/^\/api\//, /^\/media\//, /^\/django-admin/],
        runtimeCaching: [
          { urlPattern: /\/api\//, handler: "NetworkOnly" },
        ],
      },
      manifest: {
        name: "AGRIMIKA — Kilimo ni Maisha",
        short_name: "AGRIMIKA",
        description: "Jifunze kilimo bora, nunua pembejeo na ungana na wakulima wenzako.",
        lang: "sw",
        theme_color: "#03160D",
        background_color: "#F2FBF5",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "assets/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "assets/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "assets/icons/maskable-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
