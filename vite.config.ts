/*
 * 1PM Calculator
 * MIT License, Copyright (c) 2026 Ivan Gladyshev
 */
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Объявление файловое, а не глобальное: нужен один process.env в конфиге,
// тянуть ради этого @types/node в зависимости незачем
declare const process: { env: Record<string, string | undefined> }

// GitHub Pages отдаёт сайт из /имя-репозитория/, Netlify и локальный
// просмотр - из корня. Путь приходит из переменной, менять конфиг не нужно.
const base = process.env.BASE_PATH ?? '/'

export default defineConfig({
  base,
  // Без явного host Vite на этой машине биндится только на IPv6 (::1),
  // и браузер, идущий на 127.0.0.1, получает отказ. 0.0.0.0 заодно
  // открывает доступ с телефона в той же сети - для PWA это и нужно.
  server: { host: '0.0.0.0', port: 5173 },
  preview: { host: '0.0.0.0', port: 4173 },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon-180x180.png'],
      manifest: {
        name: '1ПМ Калькулятор',
        short_name: '1ПМ',
        description: 'Калькулятор одноповторного максимума с историей и графиками',
        lang: 'ru',
        theme_color: '#121316',
        background_color: '#121316',
        display: 'standalone',
        orientation: 'portrait',
        id: base,
        scope: base,
        start_url: base,
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // woff2 включён явно: самохостящиеся шрифты должны попадать в precache,
        // иначе офлайн-запуск отрисуется системным шрифтом
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
  },
})
