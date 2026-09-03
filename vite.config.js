import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  base: '/Madad-blood-platform/',
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // أي طلب يبدأ بـ /api سيتم تحويله إلى خادم أودو الخلفي
      '/api': {
        target: 'http://localhost:8069', // ضع هنا رابط خادم أودو الخاص بك
        changeOrigin: true,
        secure: false,
      }
    }
  }
})