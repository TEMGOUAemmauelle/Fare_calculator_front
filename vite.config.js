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
      injectRegister: 'auto',
      workbox: {
        // Autoriser la mise en cache de gros bundles (JS + image Yaounde) pour éviter l'erreur de build
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.mapbox\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'mapbox-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 heures
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/nominatim\.openstreetmap\.org\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'nominatim-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 jours
              },
            },
          },
          {
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60, // 1 heure
              },
              networkTimeoutSeconds: 10,
            },
          },
        ],
      },
      manifest: {
        name: 'Fare Calculator - Taxi Cameroun',
        short_name: 'FareCalc',
        description: "Estimation de prix de taxi au Cameroun avec données de trafic en temps réel",
        theme_color: '#f3cd08',
        background_color: '#f8f8f5',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        lang: 'fr-CM',
        orientation: 'portrait-primary',
        categories: ['travel', 'navigation', 'utilities'],
        icons: [
          {
            src: '/taxi-logo-v2.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/taxi-logo-v2.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/taxi-logo-v2.png',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ],
        shortcuts: [
          {
            name: 'Estimer un trajet',
            short_name: 'Estimer',
            description: 'Calculer le prix d\'un trajet',
            url: '/estimate',
            icons: [{ src: '/taxi-logo-v2.png', sizes: '192x192' }]
          },
          {
            name: 'Ajouter un trajet',
            short_name: 'Ajouter',
            description: 'Contribuer avec un nouveau trajet',
            url: '/add-trajet',
            icons: [{ src: '/taxi-logo-v2.png', sizes: '192x192' }]
          }
        ]
      }
    }),
    tailwindcss(),
  ],
})
