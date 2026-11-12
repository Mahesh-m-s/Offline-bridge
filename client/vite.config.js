import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
        'favicon.svg',
        'icons/arivunet-logo.svg',
        'icons/icon-192.svg',
        'icons/icon-512.svg',
        'icons/icon-maskable-512.svg'
      ],
      manifest: {
        id: '/',
        name: 'OfflineBridge — Know Your Rights. Access Your Services.',
        short_name: 'OfflineBridge',
        description: 'OfflineBridge: Offline-first PWA for rural digital services — know your rights, access your services.',
        theme_color: '#15803d',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        categories: ['government', 'productivity', 'utilities'],
        icons: [
          {
            src: '/icons/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: '/icons/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: '/icons/icon-maskable-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'style' || request.destination === 'script' || request.destination === 'worker',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
              }
            }
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
              }
            }
          },
          {
            // Strictly whitelist approved public, read-only scheme catalogue endpoints.
            // Exclude: /api/auth/*, /api/applications/*, /api/grievances/*, /api/sync/*, /api/audit/*, /api/users/*
            urlPattern: ({ url, request }) => {
              // Ensure only GET requests are ever cached (POST/PUT/PATCH/DELETE must NEVER be cached)
              if (request.method !== 'GET') return false;

              const pathname = url.pathname;
              // Approved public read-only catalogue endpoints
              const isPublicSchemeCatalogue =
                pathname === '/api/schemes' ||
                pathname.startsWith('/api/schemes/') ||
                pathname === '/api/health';

              return isPublicSchemeCatalogue;
            },
            handler: 'NetworkFirst',
            options: {
              cacheName: 'public-scheme-catalogue-cache',
              networkTimeoutSeconds: 4,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
              },
              cacheableResponse: {
                statuses: [200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  server: {
    port: 5173,
    host: true
  }
});
