import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import type { IWindow } from './mocks/types/others.types'
import type { IStateWindow } from './mocks/types/window.types'                       // ← nuevo
import { createPinia } from 'pinia'
import { type IBillsplitWindow} from '@billsplit/types'
import router from './router'
import { i18n } from './plugins/i18n'




declare const window: IWindow & IStateWindow & IBillsplitWindow

;(async () => {
  if (import.meta.env.VITE_APP_NODE_ENV === 'development' && window._isMockingEnabledPromise) {
    await window._isMockingEnabledPromise
  }

  // Exponer versiones en window para debug ← nuevo bloque
  ;(window as unknown as IBillsplitWindow).__BILLSPLIT__ = {
    web: __WEB_VERSION__,
    api: __API_VERSION__,
    env: import.meta.env.MODE,
  }

  const pinia = createPinia()
  createApp(App).use(router).use(pinia).use(i18n).mount('#app')
})()
