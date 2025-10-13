import axios, {type AxiosError, type AxiosInstance} from "axios"

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
    const runtimeConfig = useRuntimeConfig()

    axiosInstance = axios.create({
      baseURL: runtimeConfig.public.webApiBaseUrl,
    })
  }

  return {axios: axiosInstance, catchAxiosErrors}
}

