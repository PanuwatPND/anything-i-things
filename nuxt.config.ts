// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/png', href: '/app-icon.png' },
        { rel: 'apple-touch-icon', href: '/app-icon.png' },
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
