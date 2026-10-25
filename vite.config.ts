import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // FIXED: must be a function, not object
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) return 'react-vendor'
            if (id.includes('lucide-react')) return 'icons'
            if (id.includes('@supabase')) return 'supabase'
            return 'vendor'
          }
        }
      }
    }
  },
  server: {
    port: 5173
  }
})