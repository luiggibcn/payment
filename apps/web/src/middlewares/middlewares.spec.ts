import { describe, it, expect, beforeEach } from 'vitest'
import { ClientMiddleware } from './middlewares'
import type { ClientRequestOptions, ClientResponse } from '@/types/src/client'

describe('ClientMiddleware', () => {
  let middleware: ClientMiddleware

  beforeEach(() => {
    middleware = new ClientMiddleware()
  })

  describe('beforeRequest', () => {
    it('should return the config unchanged by default', async () => {
      const config: ClientRequestOptions = {
        url: '/api/users',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      } as any

      const result = await middleware.beforeRequest(config)

      expect(result).toEqual(config)
      expect(result).toBe(config)
    })

    it('should handle config with all properties', async () => {
      const config: ClientRequestOptions = {
        url: '/api/users/123',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token123'
        },
        data: { name: 'John Doe' },
        params: { include: 'profile' }
      } as any

      const result = await middleware.beforeRequest(config)

      expect(result).toEqual(config)
      expect(result.url).toBe('/api/users/123')
      expect(result.method).toBe('POST')
    })

    it('should handle minimal config', async () => {
      const config: ClientRequestOptions = {
        url: '/api/ping',
        method: 'GET'
      } as any

      const result = await middleware.beforeRequest(config)

      expect(result).toEqual(config)
    })

    it('should be async and return a promise', async () => {
      const config: ClientRequestOptions = {
        url: '/api/test',
        method: 'GET'
      } as any

      const result = middleware.beforeRequest(config)

      expect(result).toBeInstanceOf(Promise)
      await expect(result).resolves.toEqual(config)
    })
  })

  describe('afterSuccessfulRequest', () => {
    it('should return the response unchanged by default', async () => {
      const config: ClientRequestOptions = {
        url: '/api/users',
        method: 'GET'
      } as any

      const response: ClientResponse<any> = {
        data: { id: 1, name: 'John' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config
      } as any

      const result = await middleware.afterSuccessfulRequest(config, response)

      expect(result).toEqual(response)
      expect(result).toBe(response)
    })

    it('should handle different response types', async () => {
      const config: ClientRequestOptions = {
        url: '/api/products',
        method: 'GET'
      } as any

      const response: ClientResponse<Array<any>> = {
        data: [
          { id: 1, name: 'Product 1' },
          { id: 2, name: 'Product 2' }
        ],
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
        config
      } as any

      const result = await middleware.afterSuccessfulRequest(config, response)

      expect(result.data).toHaveLength(2)
      expect(result.status).toBe(200)
    })

    it('should handle 201 Created response', async () => {
      const config: ClientRequestOptions = {
        url: '/api/users',
        method: 'POST',
        data: { name: 'Jane' }
      } as any

      const response: ClientResponse<any> = {
        data: { id: 123, name: 'Jane' },
        status: 201,
        statusText: 'Created',
        headers: {},
        config
      } as any

      const result = await middleware.afterSuccessfulRequest(config, response)

      expect(result.status).toBe(201)
      expect(result.data).toEqual({ id: 123, name: 'Jane' })
    })

    it('should handle empty response body', async () => {
      const config: ClientRequestOptions = {
        url: '/api/users/123',
        method: 'DELETE'
      } as any

      const response: ClientResponse<null> = {
        data: null,
        status: 204,
        statusText: 'No Content',
        headers: {},
        config
      } as any

      const result = await middleware.afterSuccessfulRequest(config, response)

      expect(result.data).toBeNull()
      expect(result.status).toBe(204)
    })
  })

  describe('afterFailedRequest', () => {
    it('should throw the error by default', async () => {
      const config: ClientRequestOptions = {
        url: '/api/users',
        method: 'GET'
      } as any

      const error = {
        message: 'Network Error',
        name: 'NetworkError',
        config,
        code: 'ECONNABORTED'
      } as any

      await expect(
        middleware.afterFailedRequest(config, error)
      ).rejects.toThrow('Network Error')

      await expect(
        middleware.afterFailedRequest(config, error)
      ).rejects.toEqual(error)
    })

    it('should throw error with 404 response', async () => {
      const config: ClientRequestOptions = {
        url: '/api/users/999',
        method: 'GET'
      } as any

      const error = {
        message: 'Request failed with status code 404',
        name: 'AxiosError',
        config,
        code: 'ERR_BAD_REQUEST',
        response: {
          data: { error: 'User not found' },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config
        }
      } as any

      await expect(
        middleware.afterFailedRequest(config, error)
      ).rejects.toThrow('Request failed with status code 404')
    })

    it('should throw error with 401 Unauthorized', async () => {
      const config: ClientRequestOptions = {
        url: '/api/protected',
        method: 'GET'
      } as any

      const error = {
        message: 'Unauthorized',
        name: 'AxiosError',
        config,
        code: 'ERR_BAD_REQUEST',
        response: {
          data: { error: 'Invalid token' },
          status: 401,
          statusText: 'Unauthorized',
          headers: {},
          config
        }
      } as any

      await expect(
        middleware.afterFailedRequest(config, error)
      ).rejects.toEqual(error)
    })

    it('should throw error with 500 Server Error', async () => {
      const config: ClientRequestOptions = {
        url: '/api/users',
        method: 'POST'
      } as any

      const error = {
        message: 'Internal Server Error',
        name: 'AxiosError',
        config,
        code: 'ERR_BAD_RESPONSE',
        response: {
          data: { error: 'Database connection failed' },
          status: 500,
          statusText: 'Internal Server Error',
          headers: {},
          config
        }
      } as any

      await expect(
        middleware.afterFailedRequest(config, error)
      ).rejects.toThrow('Internal Server Error')
    })

    it('should throw network error without response', async () => {
      const config: ClientRequestOptions = {
        url: '/api/users',
        method: 'GET'
      } as any

      const error = {
        message: 'Network Error',
        name: 'NetworkError',
        config,
        code: 'ECONNABORTED'
      } as any

      await expect(
        middleware.afterFailedRequest(config, error)
      ).rejects.toEqual(error)

      try {
        await middleware.afterFailedRequest(config, error)
      } catch (err) {
        expect(err).toBe(error)
      }
    })
  })

  describe('Integration', () => {
    it('should work in a request flow', async () => {
      const config: ClientRequestOptions = {
        url: '/api/users',
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      } as any

      const processedConfig = await middleware.beforeRequest(config)
      expect(processedConfig).toEqual(config)

      const response: ClientResponse<any> = {
        data: { id: 1, name: 'John' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: processedConfig
      } as any

      const processedResponse = await middleware.afterSuccessfulRequest(
        processedConfig,
        response
      )
      expect(processedResponse).toEqual(response)
    })

    it('should handle error flow', async () => {
      const config: ClientRequestOptions = {
        url: '/api/error',
        method: 'GET'
      } as any

      const processedConfig = await middleware.beforeRequest(config)

      const error = {
        message: 'Server Error',
        name: 'Error',
        config: processedConfig,
        code: 'ERR_BAD_RESPONSE'
      } as any

      await expect(
        middleware.afterFailedRequest(processedConfig, error)
      ).rejects.toThrow('Server Error')
    })
  })
})
