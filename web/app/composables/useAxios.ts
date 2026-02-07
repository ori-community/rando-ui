import axios, {type AxiosError, type AxiosInstance} from "axios"
import {useBaseUrls} from "~/composables/useBaseUrls"

let axiosInstance: AxiosInstance | null = null

const catchAxiosErrors = async (block: () => Promise<void>, onError: (e: AxiosError) => Promise<void>) => {
  try {
    await block()
  } catch (e: unknown) {
    if (!axios.isAxiosError(e)) {
      throw e
    }

    await onError(e)
  }
}

export const useAxios = () => {
  if (axiosInstance === null) {
    axiosInstance = axios.create()

    axiosInstance.interceptors.request.use(async (config) => {
      if (!config.baseURL) {
        const {apiBaseUrl} = await useBaseUrls()

        config.baseURL = apiBaseUrl

        // Cache the base URL for upcoming requests
        if (axiosInstance) {
          axiosInstance.defaults.baseURL = apiBaseUrl
        }
      }

      return config
    })
  }

  return {axios: axiosInstance, catchAxiosErrors}
}

