import { isElectron } from '~/assets/lib/isElectron'

export default async ({ $axios, env }, inject) => {
  const $websocket = {}

  if (isElectron()) {
    const settings = await window.electronApi.invoke('settings.readSettings')
    $axios.defaults.baseURL = `https://${settings.Paths.URL}/api`
    $websocket.baseURL = `wss://${settings.Paths.URL}/api`
  } else {
    $axios.defaults.baseURL = env.API_BASE_URL
    $websocket.baseURL = env.WS_BASE_URL
  }

  console.log(`Set API base URL to ${$axios.defaults.baseURL}`)

  inject('websocket', $websocket)
}
