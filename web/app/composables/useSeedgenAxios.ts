import BaseAxios, {type AxiosRequestConfig} from "axios"

const AXIOS_SEEDGEN_RETRY_NAMESPACE = "seedgen-retry"

type SeedgenAxiosRetryConfig = {
  triedToStartServer: boolean,
}

declare module "axios" {
  export interface AxiosRequestConfig {
    "seedgen-retry"?: SeedgenAxiosRetryConfig;
  }
}

export const useSeedgenAxios = () => {
  const electronApi = useElectronApi()

  if (electronApi) {
    const axiosInstance = BaseAxios.create({
      baseURL: "http://127.0.0.1:51413",
    })

    axiosInstance.interceptors.request.use((config) => {
      config[AXIOS_SEEDGEN_RETRY_NAMESPACE] = config[AXIOS_SEEDGEN_RETRY_NAMESPACE] || {triedToStartServer: false}
      return config
    })

    axiosInstance.interceptors.response.use(null, async (error) => {
      const {config}: { config: AxiosRequestConfig } = error
      const isNetworkError = !error.response && error.code

      if (isNetworkError && !config.signal?.aborted && !config[AXIOS_SEEDGEN_RETRY_NAMESPACE]?.triedToStartServer) {
        await electronApi.seedgenServer.ensureRunning.query()
        config[AXIOS_SEEDGEN_RETRY_NAMESPACE] = {triedToStartServer: true}
        return await axiosInstance(config) ?? await Promise.reject(error)
      }
    })

    return axiosInstance
  }

  return BaseAxios.create({
    baseURL: "https://seedgen-api.wotw.orirando.com",
  })
}
