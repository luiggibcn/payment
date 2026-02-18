// apps/web/src/composables/useBack.ts
import apiClient from '@/clients/client'

export const useBack = () => {
  const getHealth = async () => {
    try {
      const { data } = await apiClient.get<{ status: string; timestamp: string }>('/api/health')
      return data
    } catch (error) {
      console.error('API error:', error)
    }
  }

  return { getHealth }
}
