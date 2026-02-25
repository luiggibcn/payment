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
      const userId = `user_${getRandomUUIDUser()}`
      ws.userId = userId
      connectedUsers.add(userId)

      console.log(`Cliente conectado: ${userId} (Total: ${connectedUsers.size})`)

      ws.send(JSON.stringify({
        type: 'user_id',
        userId: userId
      }))

      broadcastUserCount()

      ws.on('message', (message: Buffer) => {
        const messageStr = message.toString()

        try {
          const data = JSON.parse(messageStr)

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

    console.log('WebSocket server disponible en ws://localhost:5173/ws')
  }
})

const webPkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true,
  },
  plugins: [vue(), tailwindcss(), webSocketPlugin()],
  define: {
    __WEB_VERSION__: JSON.stringify(webPkg.version),
    __API_VERSION__: JSON.stringify('0.0.0'),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
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
