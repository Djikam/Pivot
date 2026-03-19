import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  plugins: [vue()],
  build: {
    sourcemap: false,
    // Désactiver module preload → corrige "Unable to preload CSS" sur Netlify
    modulePreload: false,
    // Désactiver le CSS code-splitting → inline CSS dans les chunks JS
    // Évite les erreurs MIME "text/html" pour les .css lazy-loadés
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/vue') || id.includes('node_modules/vue-router') || id.includes('node_modules/pinia')) return 'vendor'
          if (id.includes('@supabase')) return 'supabase'
          if (id.includes('lucide')) return 'icons'
        }
      }
    },
    chunkSizeWarningLimit: 2000
  }
})
