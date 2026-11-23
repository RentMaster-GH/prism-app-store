import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    VitePWA({
      selfDestroying: true,
      cleanupOutdatedCaches: true,
      registerType: "autoUpdate",
      includeAssets: ["icon-192.png", "icon-512.png", "pwa-maskable-512x512.png"],
      manifest: {
        name: "Prism App Store",
        short_name: "Prism Store",
        description: "Self-Hosted Cross-Device App Directory with Offline Mode",
        theme_color: "#12132a",
        background_color: "#0a0b18",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/pwa-maskable-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        navigateFallback: "/index.html",
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|webp)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "prism-images-cache",
              expiration: { maxEntries: 150, maxAgeSeconds: 2592000 }
            }
          },
          {
            urlPattern: /^https:\/\/api\.credibleartisans\.com\/data\/.*/,
            handler: "NetworkFirst",
            options: {
              cacheName: "prism-offline-catalog",
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 60, maxAgeSeconds: 604800 }
            }
          }
        ]
      }
    }),
    react()
  ],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          supabase: ["@supabase/supabase-js"],
          icons: ["lucide-react"]
        }
      }
    }
  }
});
