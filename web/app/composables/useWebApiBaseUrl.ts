import type {Settings} from "@shared/types/settings"

function getBaseUrlFromSettings(settings: Settings): string {
  const protocol = settings.ServerTLS
    ? "https"
    : "http"

  return `${protocol}://${settings.ServerHost}/api`
}

export const useWebApiBaseUrl = async () => {
  const electronApi = useElectronApi()

  return electronApi !== null
    ? getBaseUrlFromSettings(await electronApi.settings.getSettings.query())
    : useRuntimeConfig().public.webApiBaseUrl
}
