import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [react(), VitePWA({
    strategies: 'injectManifest',
    srcDir: 'src',
    filename: 'sw.js',
    registerType: 'prompt',
    injectRegister: false,
    manifestFilename: 'manifest.webmanifest',
    includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icons/*.png'],
    manifest: {
      name: 'OfflineBridge — Rural Digital Services', short_name: 'OfflineBridge',
      description: 'Rural services that work with or without a network connection.',
      theme_color: '#17613e', background_color: '#f5f7f3', display: 'standalone',
      orientation: 'portrait-primary', scope: '/', start_url: '/',
      icons: [
        { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
        { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
      ]
    },
    injectManifest: { globPatterns: ['**/*.{js,css,html,ico,png,svg,json,webmanifest,woff2}'] }
  })],
  server: { host: '0.0.0.0', port: 5173, proxy: { '/api': { target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:5000', changeOrigin: true } } }
});
