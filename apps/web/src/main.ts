import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createPinia } from 'pinia'
import { type IBillsplitWindow} from '@billsplit/types'
import router from './router'
import { i18n } from './plugins/i18n'

declare const window: Window & IBillsplitWindow

;(window as unknown as IBillsplitWindow).__BILLSPLIT__ = {
  web: __WEB_VERSION__,
  api: __API_VERSION__,
  env: import.meta.env.MODE,
}

const pinia = createPinia()
createApp(App).use(router).use(pinia).use(i18n).mount('#app')
