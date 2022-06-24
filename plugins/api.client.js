import { isElectron } from '~/assets/lib/isElectron'

export default async ({ $axios, env }, inject) => {
  const $paths = {}

  if (isElectron()) {
    const settings = await window.electronApi.invoke('settings.getSettings')
    $paths.API_BASE_URL = `http${settings['Flags.Insecure'] ? '' : 's'}://${settings['Paths.URL']}/api`
    $paths.WS_BASE_URL = `ws${settings['Flags.Insecure'] ? '' : 's'}://${settings['Paths.URL']}/api`
    $paths.UI_BASE_URL = `http${settings['Flags.Insecure'] ? '' : 's'}://${settings['Paths.URL']}`
  } else {
    $paths.API_BASE_URL = env.API_BASE_URL
    $paths.WS_BASE_URL = env.WS_BASE_URL
    $paths.UI_BASE_URL = env.UI_BASE_URL
  }

  $axios.defaults.baseURL = $paths.API_BASE_URL

  console.log(`Set API base URL to ${$axios.defaults.baseURL}`)

  inject('paths', $paths)
}
