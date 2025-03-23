import type { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios"
import type { ClientMiddleware } from "../../../middlewares/middlewares"

export type ClientHeader = Record<string, string>
export type ClientPathParameter = Record<string, string | number | boolean>
export type ClientQueryParameter = Record<string, string | number | boolean>
export enum ClientMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE'
  }
  
export type ClientOptions = {
  readonly baseUrl: string
  readonly headers?: ClientHeader
  readonly queryParams?: ClientQueryParameter
  readonly pathParams?: ClientPathParameter
  readonly requestOptions?: ClientRequestOptions
  readonly middlewares?: ClientMiddleware[]
}


export type ClientBody =
  | Object
  | string
  | FormData
  | URLSearchParams
  | Blob
  | ArrayBufferView
  | ArrayBuffer
  | ReadableStream<Uint8Array>
  | null
  | undefined

  export type ClientException = {
    statusCode: number
    status: ClientStatus
    isRequestError: boolean
    isAxiosError: boolean
    error?: Error | AxiosError
    data?: any
  }
  

export interface ClientMiddlewareOptions {}

export type ClientRequestOptions = AxiosRequestConfig & {
    queryParams?: ClientQueryParameter
    requestOptions?: ClientRequestOptions
    middlewareOptions?: ClientMiddlewareOptions
  }
  
  export type ClientGetRequestOptions = ClientRequestOptions & {
    headers?: ClientHeader
    path: string
    pathParams?: ClientPathParameter
  }
  
  export type ClientPostRequestOptions = ClientGetRequestOptions & {
    body?: ClientBody
  }
  
  export type ClientPutRequestOptions = ClientPostRequestOptions
  
  export type ClientPatchRequestOptions = ClientPostRequestOptions
  
  // NOTE/REFACTOR: should be the following type, as DELETE should not have any body! – export type ClientDeleteRequestOptions = ClientGetRequestOptions
  export type ClientDeleteRequestOptions = ClientPostRequestOptions
  
  export type ClientResponse<ResponseType> = AxiosResponse<ResponseType> & {
    statusCode: number
    status: ClientStatus
  }
  export enum ClientStatus {
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    TIMEOUT = 408,
    CONFLICT = 409,
    GONE = 410,
    PAGE_EXPIRED = 419, // CSRF Token expired
    TOO_MANY_REQUESTS = 429,
    INTERNAL_SERVER_ERROR = 500,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503,
    UNKOWN = 0
  }

  export enum CartServiceClientExceptionMessageLevel {
    ERROR = 'ERROR',
    WARNING = 'WARNING',
    INFO = 'INFO',
    DEBUG = 'DEBUG',
    SUCCESS = 'SUCCESS'
  }
  
  export type CartServiceClientExceptionMessage = {
    path: string
    level: CartServiceClientExceptionMessageLevel
    translationKey: string
    translationParams: Record<string, any> | null
    defaultMessage: string
    displayHeader?: boolean
  }
  
  export type CartServiceClientException = ClientException & {
    messages?: CartServiceClientExceptionMessage[]
    flowHint?: any
  }