// apps/web/src/clients/api.client.ts
import axios from 'axios'

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor de request — añade headers comunes a todas las peticiones
axiosClient.interceptors.request.use((config) => {
  config.headers['X-PAYMENT'] = 'id'
  config.headers['X-DATA'] = new Date().toDateString()
  // Aquí en el futuro añadirías el token JWT: config.headers['Authorization'] = `Bearer ${token}`
  return config
})

// Interceptor de response — manejo de errores centralizado
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // redirigir a login si hace falta
    }
    return Promise.reject(error)
  }
)

export default axiosClient
