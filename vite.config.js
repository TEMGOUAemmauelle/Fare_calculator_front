import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite';


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic'
    }),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Calculateur de tarif',
        short_name: 'FareCalc',
        description: "Calculateur de tarif",
        theme_color: '#111827',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        lang: 'fr',
        icons: [
          // PNG icons (wide compatibility)
          {
            src: '/taxi-logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/taxi-logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
          // SVG as fallback / scalable icon
          {
            src: '/pwa-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ]
      }
    }),
    tailwindcss(),
  ],
})
