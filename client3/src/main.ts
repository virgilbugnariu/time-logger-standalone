// Roboto is bundled with the app so it works offline (no Google Fonts request).
import '@fontsource/roboto/400'
import '@fontsource/roboto/500'
import '@fontsource/roboto/700'
import './app.css'
import App from './App.svelte'

const app = new App({
  target: document.getElementById('app'),
})

export default app
