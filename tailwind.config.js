/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,vue,ts}',
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      colors: {
        gray: '#D8D8D8',
      },
      fontFamily: {
        // montserrat: ['Montserrat', 'sans-serif'],
        // sarabun: ['Sarabun', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
