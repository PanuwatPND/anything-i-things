// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    openaiApiKey: '',
    /** Google AI Studio / Gemini API key (เซิร์ฟเวอร์เท่านั้น — ตั้งใน .env เป็น NUXT_GEMINI_API_KEY) */
    geminiApiKey: '',
    /** โมเดล Vision สำหรับอ่านสลิป (override ด้วย NUXT_GEMINI_MODEL) */
    geminiModel: 'gemini-2.5-flash',
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
        { rel: 'manifest', href: '/manifest.webmanifest' },
      ],
    },
    // อย่าใช้ mode: 'out-in' — ช่วงเปลี่ยนหน้าจะว่าง (จอขาว) ระหว่าง leave กับ enter
    pageTransition: { name: 'page' },
    layoutTransition: { name: 'page' },
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
})
