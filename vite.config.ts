import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    devtools({
      // Avoid dev-server crash when the default event-bus port (42069) is taken.
      // You can re-enable if you want the TanStack devtools event bus.
      eventBusConfig: {
        enabled: false,
        port: 42070,
      },
    }),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    viteReact(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // We register via `src/pwa.ts`; prevent double-registration.
      injectRegister: null,
      // Keep SW generation off in dev to avoid noisy `dev-dist` glob warnings.
      // Test install/offline via `npm run build` + `npm run preview`.
      devOptions: {
        enabled: false,
      },
      includeAssets: ['favicon.ico', 'robots.txt', 'logo192.png', 'logo512.png'],
      workbox: {
        // SPA offline support: when offline, still serve the app shell for navigation requests.
        navigateFallback: '/index.html',
        clientsClaim: true,
        skipWaiting: true,
      },
      manifest: {
        name: 'Expense Tracker',
        short_name: 'Expenses',
        description: 'Track expenses and shopping lists',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#4b1a5c',
        icons: [
          {
            src: 'logo192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
