import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { WebSocketServer, WebSocket } from 'ws'
import { getRandomUUIDUser } from './src/utils'
import type { Plugin } from 'vite'
import type { IncomingMessage } from 'node:http'
import type { Duplex } from 'node:stream'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

interface ExtendedWebSocket extends WebSocket {
  userId?: string
}

const webSocketPlugin = (): Plugin => ({
  name: 'websocket-plugin',
  configureServer(server) {
    const wss = new WebSocketServer({ 
      noServer: true 
    })
    
    const connectedUsers = new Set<string>()
    
    const broadcastUserCount = () => {
      const message = JSON.stringify({
        type: 'user_count',
        count: connectedUsers.size,
        users: Array.from(connectedUsers)
      })
      
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message)
        }
      })
    }
    
    server.httpServer?.on('upgrade', (request: IncomingMessage, socket: Duplex, head: Buffer) => {
      if (request.url === '/ws') {
        wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
          wss.emit('connection', ws, request)
        })
      }
    })
    
    wss.on('connection', (ws: ExtendedWebSocket) => {
      // Generar ID único para el usuario
      const userId = `user_${getRandomUUIDUser()}`
      ws.userId = userId
      connectedUsers.add(userId)
      
      console.log(`Cliente conectado: ${userId} (Total: ${connectedUsers.size})`)
      
      // Enviar su propio ID al cliente
      ws.send(JSON.stringify({
        type: 'user_id',
        userId: userId
      }))
      
      // Notificar a todos sobre el nuevo usuario
      broadcastUserCount()
      
      ws.on('message', (message: Buffer) => {
        const messageStr = message.toString()
        
        try {
          const data = JSON.parse(messageStr)
          
          // Broadcast del QR a todos los clientes
          if (messageStr === 'ping' || messageStr === 'pong') {
             return
          }
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'qr_generated',
                ...data,
                userId: ws.userId
              }))
            }
          })
        } catch (e) {
          console.error('Error parsing message:', e)
        }
      })

      ws.on('close', () => {
        if (ws.userId) {
          connectedUsers.delete(ws.userId)
          console.log(`Cliente desconectado: ${ws.userId} (Total: ${connectedUsers.size})`)
          broadcastUserCount()
        }
      })
    })

    console.log('WebSocket server disponible en ws://localhost:1313/ws')
  }
})

const webPkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))
const apiPkg = JSON.parse(readFileSync(resolve(__dirname, '../api/package.json'), 'utf-8'))

// https://vite.dev/config/
export default defineConfig({
  server: {
    headers: {
      'Service-Worker-Allowed': '/'
    },
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL,
        changeOrigin: true
      }
    }
  },
  plugins: [vue(), tailwindcss(), webSocketPlugin()],
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
    'process.env.VITE_APP_NODE_ENV': JSON.stringify(process.env.VITE_APP_NODE_ENV),
    'process.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
    'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
    __WEB_VERSION__: JSON.stringify(webPkg.version),
    __API_VERSION__: JSON.stringify(apiPkg.version),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api'],
        additionalData: `
          @forward "@/scss/base.scss";
        `
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/main.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'tests',
        'dist',
        'public',
        'test-reports',
        'test-results'
      ]
    }
  }
})
