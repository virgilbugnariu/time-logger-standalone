/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        // Used by Tailwind's base styles for the whole page; system fonts are the fallback.
        sans: ['Roboto', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
  content: ["./index.html", './src/**/*.{svelte,js,ts}'], // for unused CSS
  variants: {
    extend: {},
  },
}
