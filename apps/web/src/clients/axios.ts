import axios from 'axios'

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosClient.interceptors.request.use((config) => {
  // Headers custom del BE, no se activaran hasta que negocio decida que es necesario
  // config.headers['X-PAYMENT'] = 'id'
  // config.headers['X-DATA'] = new Date().toDateString()

  // Token JWT si existe
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
