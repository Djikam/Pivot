import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  plugins: [vue()],
  build: {
    sourcemap: false, // Désactive les sourcemaps pour éviter l'erreur JSON.parse
    modulePreload: { polyfill: false },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/vue') || id.includes('node_modules/vue-router') || id.includes('node_modules/pinia')) return 'vendor'
          if (id.includes('@supabase')) return 'supabase'
          if (id.includes('lucide')) return 'icons'
        }
      }
    },
    chunkSizeWarningLimit: 1500
  }
})
