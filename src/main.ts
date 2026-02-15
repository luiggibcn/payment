import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import {worker} from './mocks/browser'
import type { IWindow } from './mocks/types/others.types'
import type { IStateWindow } from './mocks/types/window.types'
import { createPinia } from 'pinia'
import router from './router'

declare const window: IWindow & IStateWindow
if (import.meta.env.VITE_APP_NODE_ENV === 'development' && window._isMockingEnabledPromise) {
  await window._isMockingEnabledPromise
  }
const pinia = createPinia()

createApp(App).use(router).use(pinia).mount('#app')
