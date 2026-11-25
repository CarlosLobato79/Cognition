import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['assets/cognition-brain-logo.png'],
      manifest: {
        name: 'Cognition',
        short_name: 'Cognition',
        description: 'Entrenamiento cognitivo inmersivo',
        lang: 'es',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#05070a',
        theme_color: '#05070a',
        icons: [
          {
            src: './icons/cognition-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: './icons/cognition-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
})
