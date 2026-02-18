import axios, { Axios, type CancelToken, AxiosHeaders, type AxiosRequestConfig, AxiosError } from "axios"
import { deepMerge } from "@/utils"
import type { ClientMiddleware } from "@/middlewares"
import { type ClientRequestOptions, type ClientBody, type ClientResponse, ClientStatus, type ClientException, type ClientGetRequestOptions, type ClientPostRequestOptions, type ClientPutRequestOptions, type ClientPatchRequestOptions, type ClientDeleteRequestOptions } from "../types/src/client"


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


export class Client {
  private client: Axios
  private headers: ClientHeader = {}
  private queryParams: ClientQueryParameter = {}
  private pathParams: ClientPathParameter = {}
  private cancelToken?: CancelToken
  private middlewares: ClientMiddleware[] = []

  constructor(private readonly options: ClientOptions) {
    this.client = axios.create({})
  }

  protected useHeader(headers: ClientHeader): void {
    this.headers = {
      ...this.headers,
      ...headers
    }
  }

  protected useAcceptJSON(): void {
    this.headers['Accept'] = 'application/json'
  }

  protected useContentTypeJSON(withCharsetUtf8 = false): void {
    this.headers['Content-Type'] = `application/json${withCharsetUtf8 ? ';charset=utf-8' : ''}`
  }


  protected usePathParameter(parameters: ClientPathParameter): void {
    this.pathParams = {
      ...this.pathParams,
      ...parameters
    }
  }

  protected useQueryParameter(name: string, value: string | boolean | number): void {
    this.queryParams[name] = String(value)
  }

  protected useCancelToken(cancelToken: CancelToken): void {
    this.cancelToken = cancelToken
  }

  protected useMiddleware(middleware: ClientMiddleware): void {
    this.middlewares.push(middleware)
  }

  private preparePath(path: string, ...pathParams: (ClientPathParameter | undefined)[]): string {
    for (const params of pathParams) {
      if (params === undefined) continue
      for (const key in params) {
        path = path.replace(`{${key}}`, encodeURIComponent(params[key]))
      }
    }
    return path
  }

  private prepareHeaders(...headers: (ClientHeader | undefined)[]): AxiosHeaders {
    const axiosHeaders = new AxiosHeaders()
    for (const header of headers) {
      if (header === undefined) continue
      for (const key in header) {
        axiosHeaders.set(key, header[key])
      }
    }
    return axiosHeaders
  }

  private prepareQueryParameters(
    ...queryParams: (ClientQueryParameter | undefined)[]
  ): Record<string, string> {
    const params: {
      [k: string]: string
    } = {}
    for (const searchParams of queryParams) {
      if (searchParams === undefined) continue
      for (const key in searchParams) {
        params[key] = String(searchParams[key])
      }
    }
    return params
  }

  protected async request<ResponseType>(
    path: string,
    pathParams?: ClientPathParameter,
    method?: ClientMethod,
    queryParams?: ClientQueryParameter,
    body?: ClientBody,
    headers?: ClientHeader,
    requestOptions?: ClientRequestOptions
  ): Promise<ClientResponse<ResponseType>> {
    const axiosHeaders = this.prepareHeaders(this.options.headers, this.headers, headers)
    const axiosParams = this.prepareQueryParameters(
      this.options.queryParams,
      this.queryParams,
      queryParams
    )

    // prepare body
    if (axiosHeaders.has('Content-Type') && !body) {
      // viz: https://github.com/axios/axios/issues/86
      // axios is not respecting content-type headers with empty body,
      // we need to explicitely set it to empty object
      body = {}
    }

    // prepare axios options
    let axiosOptions = deepMerge<AxiosRequestConfig>(
      {
        baseURL: this.options.baseUrl
      },
      this.options?.requestOptions ?? {}
    )
    axiosOptions = deepMerge<AxiosRequestConfig>(axiosOptions, requestOptions ?? {})
    axiosOptions = deepMerge<AxiosRequestConfig>(axiosOptions, {
      url: this.preparePath(path, this.pathParams, pathParams),
      method: method ?? ClientMethod.GET,
      params: axiosParams,
      headers: axiosHeaders,
      data: body,
      cancelToken: this.cancelToken
    })

    // execute middlewares (if any)
    for (const middleware of [...(this.options.middlewares ?? []), ...this.middlewares]) {
      axiosOptions = await middleware.beforeRequest(axiosOptions)
    }

    try {
      // do actual request
      let response = await this.client.request<ResponseType>(axiosOptions)

      // convert to custom client-response
      let result: ClientResponse<ResponseType> = {
        ...response,
        statusCode: response.status,
        status:
          (Object.keys(ClientStatus)[
            Object.values(ClientStatus).indexOf(response.status)
          ] as unknown as ClientStatus) ?? ClientStatus.UNKOWN
      }

      // execute middlewares (if any)
      for (const middleware of [...(this.options.middlewares ?? []), ...this.middlewares]) {
        result = await middleware.afterSuccessfulRequest<ResponseType>(axiosOptions, result)
      }

      return result
    } catch (e: any) {
      // check, if we have an axios error
      let axiosError: AxiosError | undefined = undefined
      if (e instanceof AxiosError) {
        axiosError = e
      }

      // create custom client-exception
      let clientException: ClientException = {
        statusCode: axiosError?.response?.status ?? 500,
        status: !axiosError
          ? ClientStatus.UNKOWN
          : ((Object.keys(ClientStatus)[
              Object.values(ClientStatus).indexOf(axiosError?.response?.status ?? 0)
            ] as unknown as ClientStatus) ?? ClientStatus.UNKOWN),
        isRequestError: axiosError !== undefined,
        isAxiosError: axiosError !== undefined,
        error: axiosError ?? e,
        data: axiosError?.response?.data
      }

      // execute middlewares (if any)
      for (const middleware of [...(this.options.middlewares ?? []), ...this.middlewares]) {
        try {
          return await middleware.afterFailedRequest<ResponseType>(axiosOptions, clientException)
        } catch (e: any) {
          clientException = e as ClientException
        }
      }
      throw clientException
    }
  }

  protected async get<ResponseType>(
    options: ClientGetRequestOptions
  ): Promise<ClientResponse<ResponseType>> {
    return this.request<ResponseType>(
      options.path,
      options.pathParams,
      ClientMethod.GET,
      options.queryParams,
      undefined,
      options.headers,
      options.requestOptions
    )
  }

  protected async post<ResponseType>(
    options: ClientPostRequestOptions
  ): Promise<ClientResponse<ResponseType>> {
    return this.request<ResponseType>(
      options.path,
      options.pathParams,
      ClientMethod.POST,
      options.queryParams,
      options.body,
      options.headers,
      options.requestOptions
    )
  }

  protected async put<ResponseType>(
    options: ClientPutRequestOptions
  ): Promise<ClientResponse<ResponseType>> {
    return this.request<ResponseType>(
      options.path,
      options.pathParams,
      ClientMethod.PUT,
      options.queryParams,
      options.body,
      options.headers,
      options.requestOptions
    )
  }

  protected async patch<ResponseType>(
    options: ClientPatchRequestOptions
  ): Promise<ClientResponse<ResponseType>> {
    return this.request<ResponseType>(
      options.path,
      options.pathParams,
      ClientMethod.PATCH,
      options.queryParams,
      options.body,
      options.headers,
      options.requestOptions
    )
  }

  protected async delete<ResponseType>(
    options: ClientDeleteRequestOptions
  ): Promise<ClientResponse<ResponseType>> {
    return this.request<ResponseType>(
      options.path,
      options.pathParams,
      ClientMethod.DELETE,
      options.queryParams,
      // REFACTOR: we should remove body as soon as checkout-api has been refactored!
      options.body,
      options.headers,
      options.requestOptions
    )
  }
}
