import { isElectron } from '~/assets/lib/isElectron'

export default async ({ $axios, env }, inject) => {
  const $paths = {}

  if (isElectron()) {
    const settings = await window.electronApi.invoke('settings.readSettings')
    $paths.API_BASE_URL = `https://${settings.Paths.URL}/api`
    $paths.WS_BASE_URL = `wss://${settings.Paths.URL}/api`
    $paths.UI_BASE_URL = `https://${settings.Paths.URL}`
  } else {
    $paths.apiBaseUrl = env.API_BASE_URL
    $paths.websocketBaseUrl = env.WS_BASE_URL
    $paths.uiBaseUrl = env.UI_BASE_URL
  }

  $axios.defaults.baseURL = $paths.API_BASE_URL

  console.log(`Set API base URL to ${$axios.defaults.baseURL}`)

  inject('paths', $paths)
}
