import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Prism App Store',
        short_name: 'Prism',
        theme_color: '#12132a',
        background_color: '#0a0b18',
        display: 'standalone',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        runtimeCaching: [
          { urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|webp)$/, handler: 'CacheFirst', options: { cacheName: 'images', expiration: { maxEntries: 100, maxAgeSeconds: 2592000 } } },
          { urlPattern: /^https:\/\/api\./, handler: 'NetworkFirst', options: { cacheName: 'api' } }
        ]
      }
    }),react()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          icons: ['lucide-react'],
        }
      }
    }
  }
})
