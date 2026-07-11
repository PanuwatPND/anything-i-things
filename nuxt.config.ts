// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@vite-pwa/nuxt'],
  runtimeConfig: {
    openaiApiKey: '',
    /** Google AI Studio / Gemini API key (เซิร์ฟเวอร์เท่านั้น — ตั้งใน .env เป็น NUXT_GEMINI_API_KEY) */
    geminiApiKey: '',
    /** โมเดล Vision สำหรับอ่านสลิป (override ด้วย NUXT_GEMINI_MODEL) */
    geminiModel: 'gemini-2.5-flash',
    /** Telegram Bot — ตั้งใน .env: NUXT_TELEGRAM_BOT_TOKEN และ NUXT_TELEGRAM_CHAT_ID */
    telegramBotToken: '',
    telegramChatId: '',
    /** LINE Messaging API — ตั้งใน .env: NUXT_LINE_CHANNEL_ACCESS_TOKEN */
    lineChannelAccessToken: '',
    public: {
      /** Supabase — ตั้งใน .env: NUXT_PUBLIC_SUPABASE_URL และ NUXT_PUBLIC_SUPABASE_ANON_KEY */
      supabaseUrl: '',
      supabaseAnonKey: '',
    },
  },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      meta: [
        {
          name: 'viewport',
          content:
            'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
        },
        { name: 'theme-color', content: '#f1f5f9' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'LunarWater' },
        { name: 'mobile-web-app-capable', content: 'yes' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/app-icon.png' },
        { rel: 'apple-touch-icon', href: '/app-icon.png' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout' },
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      id: '/',
      name: 'LunarWater',
      short_name: 'LunarWater',
      description: 'สั่งน้ำดื่มหมู่บ้าน — ง่าย รวดเร็ว',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      orientation: 'portrait-primary',
      background_color: '#f1f5f9',
      theme_color: '#f1f5f9',
      icons: [
        {
          src: '/app-icon.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/app-icon.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
      shortcuts: [
        {
          name: 'สั่งน้ำ',
          short_name: 'สั่งน้ำ',
          description: 'เปิดหน้าสั่งซื้อน้ำดื่ม',
          url: '/user/water',
          icons: [{ src: '/shortcut-shop.png', sizes: '192x192' }],
        },
        {
          name: 'ดูบิล',
          short_name: 'บิล',
          description: 'ตรวจสอบรายการสั่งซื้อและบิล',
          url: '/user/bills',
          icons: [{ src: '/shortcut-bills.png', sizes: '192x192' }],
        },
        {
          name: 'ตะกร้า',
          short_name: 'ตะกร้า',
          description: 'ดูตะกร้าสินค้า',
          url: '/user/cart',
          icons: [{ src: '/shortcut-cart.png', sizes: '192x192' }],
        },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico,webp,woff2}'],
      globIgnores: ['**/loading_app.png', '**/app-icon-original.png'],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: true,
      type: 'module',
    },
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
})
