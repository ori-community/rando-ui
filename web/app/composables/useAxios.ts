import axios, {type AxiosError} from "axios"

const axiosInstance = axios.create({
  baseURL: "https://wotw.orirando.com/api",
})

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
  return {axios: axiosInstance, catchAxiosErrors}
}

