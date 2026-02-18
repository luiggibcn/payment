import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import type { IWindow } from './mocks/types/others.types'
import type { IStateWindow } from './mocks/types/window.types'
import { createPinia } from 'pinia'
import router from './router'
import { i18n } from './plugins/i18n'

declare const window: IWindow & IStateWindow
;(async () => {
  if (import.meta.env.VITE_APP_NODE_ENV === 'development' && window._isMockingEnabledPromise) {
    await window._isMockingEnabledPromise
  }
  const pinia = createPinia()
  
  createApp(App).use(router).use(pinia).use(i18n).mount('#app')
})()
