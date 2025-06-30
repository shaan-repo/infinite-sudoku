import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/infinite-sudoku/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Infinite Sudoku',
        short_name: 'InfiniteSudoku',
        description: 'A beautiful, ad-free, minimalist Sudoku app you can play forever.',
        start_url: '.',
        display: 'standalone',
        background_color: '#f8fafc',
        theme_color: '#2563eb',
      },
    }),
  ],
})
