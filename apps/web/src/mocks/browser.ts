import { setupWorker } from 'msw/browser'
import { handlers } from './src/handlers/cart-api'
import type { IWindow } from './types/others.types'
import { handlerOptions } from './handlers'
declare const window: IWindow
export const worker = setupWorker(...handlers(handlerOptions)) // Llamando a handlers antes de pasarlo


window._isMockingEnabledPromise = worker.start({
    serviceWorker: {
        url: '../../mockServiceWorker.js',
        options: {
            scope: '/'
        }
    },
    onUnhandledRequest: 'bypass'
})
