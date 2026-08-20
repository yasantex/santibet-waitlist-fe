import { useQuery } from '@tanstack/react-query'
import {
  type UseQueryOptions,
  useMutation,
  type UseMutationOptions,
  type QueryKey,
  type MutationFunction,
  type MutationKey,
} from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import type { AxiosRequestConfig } from 'axios'

export type QueryParams = Record<
  string,
  string | number | boolean | null | undefined
>

type Truthy<T> = T extends false | '' | 0 | null | undefined ? never : T

interface QueryProps<TData> {
  path: string
  headers?: Record<string, string>
  enabled?: boolean
  queryOptions?: Omit<
    UseQueryOptions<TData, Error, TData>,
    'queryKey' | 'queryFn'
  >
  queryKey?: QueryKey
  params?: QueryParams
  onSuccess?: (data: TData) => void
  responseType?: 'json' | 'blob' | 'document' | 'formdata' | 'stream' | 'text'
}

interface MutationProps<TData, TVariables> {
  path: string
  method?: HttpMethod
  headers?: Record<string, string>
  mutationOptions?: Omit<
    UseMutationOptions<TData, Error, TVariables, unknown>,
    'mutationFn'
  >
  mutationFn?: MutationFunction<TData, TVariables> | undefined
  params?: QueryParams
  mutationKey?: MutationKey
  responseType?: 'json' | 'blob' | 'document' | 'formdata' | 'stream' | 'text'
}

type HttpMethod = 'POST' | 'PUT' | 'DELETE' | 'PATCH'

/**
 * Returns the queryKey for a react-query request. The key is obtained by splitting the url into fragments
 * @param url - API endpoint
 * @param params - optional query parameters
 * @returns array - queryKey
 */
export const getReactQueryKey = (url: string, params?: QueryParams) => {
  return [...url.split('/').filter((fragment) => fragment), params || {}]
}
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  timeout: 180000,
})
/**
 * Helper function to append query params to URL.
 */
const buildQueryParams = <T extends Record<string, unknown>>(
  params: T = {} as T,
): string => {
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => Boolean(value)),
  ) as Record<keyof T, Truthy<T[keyof T]>>

  const queryString = new URLSearchParams(
    filteredParams as Record<string, string>,
  ).toString()
  return queryString ? `?${queryString}` : ''
}

export const useSantibetQuery = <TData = unknown>({
  path,
  headers = {},
  queryOptions,
  enabled,
  queryKey,
  params = {},
  onSuccess,
  responseType = 'json',
}: QueryProps<TData>) => {
  const _headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...headers,
    // api_token: cookies?.aToken || '',
  }
  const url = `${path}${buildQueryParams(params)}`
  const fetchData = async () => {
    const config: AxiosRequestConfig = {
      url,
      method: 'GET',
      headers: _headers,
      responseType: responseType || 'json',
    }
    const response = await apiClient.request<TData>(config)
    return response.data
  }

  const queryResult = useQuery<TData, Error>({
    queryKey: queryKey || [path, params],
    queryFn: fetchData,
    ...(queryOptions || {}),
    enabled: enabled,
  })

  // onSuccess callback have been deprecated in the react-query v5 that we are using, let's manually create it, If onSuccess handler is provided, invoke it when the query succeeds
  if (queryResult.isSuccess && onSuccess) {
    onSuccess(queryResult.data!)
  }

  return queryResult
}

export const useSantibetMutation = <TData = unknown, TVariables = unknown>({
  path,
  method = 'POST',
  headers = {},
  mutationOptions,
  mutationFn,
  params = {},
  responseType = 'json',
  mutationKey,
}: MutationProps<TData, TVariables>) => {
  const _headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...headers,
  }
  const url = `${path}${buildQueryParams(params)}`
  const sendData = async (variables: TVariables) => {
    const config: AxiosRequestConfig = {
      url,
      method,
      headers: _headers,
      data: variables,
      responseType: responseType || 'json',
      withCredentials: true,
    }
    const response = await apiClient.request<TData>(config)
    return response.data
  }

  return useMutation<TData, Error, TVariables>({
    mutationKey: mutationKey || getReactQueryKey(path, params),
    mutationFn: mutationFn || sendData,
    ...mutationOptions,
  })
}

export const useCentelHRInfiniteQuery = <TData = unknown>({
  path,
  headers = {},
  queryOptions,
  enabled,
  queryKey,
  params = {},
  onSuccess,
  responseType = 'json',
}: QueryProps<TData>) => {
  const _headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...headers,
    api_token: '',
  }
  const url = `${path}${buildQueryParams(params)}`
  const fetchData = async () => {
    const config: AxiosRequestConfig = {
      url,
      method: 'GET',
      headers: _headers,
      responseType: responseType || 'json',
    }
    const response = await apiClient.request<TData>(config)
    return response.data
  }

  const queryResult = useQuery<TData, Error>({
    queryKey: queryKey || [path, params],
    queryFn: fetchData,
    ...(queryOptions || {}),
    enabled: enabled,
  })

  // onSuccess callback have been deprecated in the react-query v5 that we are using, let's manually create it, If onSuccess handler is provided, invoke it when the query succeeds
  if (queryResult.isSuccess && onSuccess) {
    onSuccess(queryResult.data!)
  }

  return queryResult
}
