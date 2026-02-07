import type {Settings} from "@shared/types/settings"

function getBaseUrlFromSettings(settings: Settings): string {
  const protocol = settings.ServerTLS
    ? "https"
    : "http"

  return `${protocol}://${settings.ServerHost}`
}

export const useBaseUrls = async () => {
  const electronApi = useElectronApi()

  const baseUrl = electronApi !== null
    ? getBaseUrlFromSettings(await electronApi.settings.getSettings.query())
    : useRuntimeConfig().public.baseUrl
  const apiBaseUrl = `${baseUrl}/api`
  const uiBaseUrl = baseUrl

  return {apiBaseUrl, uiBaseUrl}
}
