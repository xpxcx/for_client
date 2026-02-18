import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'krumova0elmira0mamedovna.ru',
      'www.krumova0elmira0mamedovna.ru',
      'krumovaoelmiraomamedovna.ru',
      'www.krumovaoelmiraomamedovna.ru',
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
