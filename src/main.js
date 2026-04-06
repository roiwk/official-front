import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

const canonicalUrl = import.meta.env.VITE_APP_URL
if (canonicalUrl) {
  const canonical = new URL(canonicalUrl)
  if (window.location.hostname !== canonical.hostname) {
    const target = new URL(window.location.href)
    target.protocol = canonical.protocol
    target.hostname = canonical.hostname
    target.port = canonical.port
    window.location.replace(target.href)
  }
}

const app = createApp(App)
app.use(router)
app.mount('#app')
