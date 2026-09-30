import postcss from './postcss.config.cjs';
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  // Tauri expects a fixed dev port and wants its own output left on screen.
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
  },
  css:{
    postcss
  }
})
