import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import { routes } from './router'
import { setRouter } from './api'
import './style.css'

export const createApp = ViteSSG(
  App,
  { routes },
  ({ app, router, head, isClient }) => {
    setRouter(router)

    if (isClient) {
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
    }
  }
)
