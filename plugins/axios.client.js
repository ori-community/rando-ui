import { isElectron } from '~/assets/lib/isElectron'

export default async ({ $axios, env }) => {
  if (isElectron()) {
    const settings = await window.electronApi.invoke('settings.readSettings')
    $axios.defaults.baseURL = `https://${settings.Paths.URL}/api`
  } else {
    $axios.defaults.baseURL = env.API_BASE_URL
  }

  console.log(`Set API base URL to ${$axios.defaults.baseURL}`)
}
