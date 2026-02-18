import type { ClientRequestOptions, ClientResponse, ClientException } from "../types/src/client"

 
export class ClientMiddleware {
    public async beforeRequest(config: ClientRequestOptions): Promise<ClientRequestOptions> {
      return config
    }
  
    public async afterSuccessfulRequest<ResponseType>(
      _config: ClientRequestOptions,
      response: ClientResponse<ResponseType>
    ): Promise<ClientResponse<ResponseType>> {
      return response
    }
  
    public async afterFailedRequest<ResponseType>(
      _config: ClientRequestOptions,
      error: ClientException
    ): Promise<ClientResponse<ResponseType>> {
      throw error
    }
  }