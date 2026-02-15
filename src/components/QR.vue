<template>
    <div>
        <!-- Debug info -->
        <div class="debug-info">
            <p>Tu ID: {{ currentUserId }}</p>
            <p>Usuarios conectados: {{ connectedUsersCount }}</p>
            <p>WebSocket: {{ status }}</p>
        </div>

        <div>
            <input 
                v-model="url" 
                type="text" 
                placeholder="Introduce la URL"
                @blur="validateUrl"
                :class="{ 'error': hasError }"
            />
            <span v-if="hasError" class="error-message">{{ errorMessage }}</span>
            <button @click="generateQR" :disabled="!url || hasError">Generar QR</button>
        </div>

        <div v-if="finalUrl">
            <h3>Tu QR generado:</h3>
            <img :src="qrcode" alt="QR Code" />
        </div>

        <div v-if="qrList.length > 0">
            <h3>QRs generados por otros usuarios:</h3>
            <div v-for="(item, index) in qrList" :key="index" class="qr-item">
                <p><strong>Usuario:</strong> {{ item.userId }}</p>
                <p><strong>URL:</strong> {{ item.url }}</p>
                <img :src="item.qrcode" alt="QR Code" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useQRCode } from '@vueuse/integrations/useQRCode'
import { useWebSocket } from '@vueuse/core'

interface QRItem {
    url: string
    qrcode: string
    timestamp: number
    userId: string
}

interface WebSocketMessage {
    type: 'user_id' | 'user_count' | 'qr_generated'
    userId?: string
    count?: number
    users?: string[]
    url?: string
    qrcode?: string
    timestamp?: number
}

const url = ref('')
const finalUrl = ref('')
const hasError = ref(false)
const errorMessage = ref('')
const qrList = ref<QRItem[]>([])
const currentUserId = ref<string>('')
const connectedUsersCount = ref<number>(0)

const isValidUrl = (value: string): boolean => {
    if (!value) return true
    
    try {
        const urlObj = new URL(value)
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
        return false
    }
}

const validateUrl = () => {
    if (url.value && !isValidUrl(url.value)) {
        hasError.value = true
        errorMessage.value = 'Por favor, introduce una URL válida (http:// o https://)'
    } else {
        hasError.value = false
        errorMessage.value = ''
    }
}

const qrcode = useQRCode(finalUrl, {
    errorCorrectionLevel: 'H',
    margin: 3,
    width: 300
})

// WebSocket connection
const { status, data, send } = useWebSocket('ws://localhost:1313/ws', {
    autoReconnect: {
        retries: 3,
        delay: 1000
    },
    heartbeat: {
        message: 'ping',
        interval: 30000
    }
})

// Procesar mensajes del WebSocket
const handleMessage = (messageStr: string) => {
    try {
        const message: WebSocketMessage = JSON.parse(messageStr)
        
        switch (message.type) {
            case 'user_id':
                currentUserId.value = message.userId || ''
                break
                
            case 'user_count':
                connectedUsersCount.value = message.count || 0
                break
                
            case 'qr_generated':
                // No agregar tu propio QR a la lista de otros usuarios
                if (message.userId !== currentUserId.value) {
                    const qrItem: QRItem = {
                        url: message.url || '',
                        qrcode: message.qrcode || '',
                        timestamp: message.timestamp || Date.now(),
                        userId: message.userId || 'unknown'
                    }
                    
                    const exists = qrList.value.some(item => 
                        item.url === qrItem.url && 
                        item.timestamp === qrItem.timestamp &&
                        item.userId === qrItem.userId
                    )
                    
                    if (!exists) {
                        qrList.value.unshift(qrItem)
                    }
                }
                break
        }
    } catch (e) {
        console.error('Error parsing WebSocket message:', e)
    }
}

watch(data, (newData) => {
    if (newData) {
        handleMessage(newData)
    }
})

const generateQR = () => {
    validateUrl()
    if (!hasError.value && url.value) {
        finalUrl.value = url.value
        
        setTimeout(() => {
            const qrData = {
                url: url.value,
                qrcode: qrcode.value,
                timestamp: Date.now()
            }
            
            if (status.value === 'OPEN') {
                send(JSON.stringify(qrData))
            }
        }, 100)
    }
}
</script>

<style scoped>
.debug-info {
    background: #426f51;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 16px;
    font-family: monospace;
}

.debug-info p {
    margin: 4px 0;
}

.error {
    border: 2px solid red;
}

.error-message {
    color: red;
    font-size: 12px;
    display: block;
    margin-top: 4px;
}

.qr-item {
    margin: 16px 0;
    padding: 16px;
    border: 1px solid #ccc;
    border-radius: 8px;
}

.qr-item p {
    margin-bottom: 8px;
    word-break: break-all;
}

.qr-item img {
    max-width: 200px;
}
</style>
