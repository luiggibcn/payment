// appsweb/src/clients/api.client.ts
import axios from 'axios'

const axiosClient = axios.create({
  baseURL: 'https://payment-api-tawny.vercel.app',
  headers: {
    'Content-Type': 'application/json'
  }
})

axiosClient.interceptors.request.use((config) => {
  config.headers['X-PAYMENT'] = 'id'
  config.headers['X-DATA'] = new Date().toDateString()

  // ← añadir el token JWT si existe en localStorage
  const session = localStorage.getItem('session')
  if (session) {
    const { access_token } = JSON.parse(session)
    config.headers['Authorization'] = `Bearer ${access_token}`
  }

  return config
})

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('session')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosClient
