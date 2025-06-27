import {defineStore} from 'pinia'

const REDIRECT_PATH_LOCAL_STORAGE_KEY = 'auth.redirectPath'
const JWT_LOCAL_STORAGE_KEY = 'auth.jwt'

const isElectron = useIsElectron()
const electronApi = isElectron ? useElectronApi() : null

export const useAuthStore = defineStore('auth', () => {
  const jwt = ref<null | string>(null)
  const redirectPath = ref<null | string>(window.localStorage.getItem(REDIRECT_PATH_LOCAL_STORAGE_KEY))

  watch(() => useAuthStore().redirectPath, (value) => {
    if (value) {
      window.localStorage.setItem(REDIRECT_PATH_LOCAL_STORAGE_KEY, value)
    } else {
      window.localStorage.removeItem(REDIRECT_PATH_LOCAL_STORAGE_KEY)
    }
  })

  watch(jwt, async (value) => {
    // Push the token to the Axios HTTP client
    const {axios} = useAxios()

    if (value) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${value}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }

    // TODO: Push the token to WebSocket client

    // Persist the new token
    if (electronApi) {
      await electronApi.auth.setClientJwt.query(value)
    } else {
      if (value) {
        window.localStorage.setItem(JWT_LOCAL_STORAGE_KEY, value)
      } else {
        window.localStorage.removeItem(JWT_LOCAL_STORAGE_KEY)
      }
    }
  })

  /**
   * Restores the JWT token from localStorage (web) or
   * the data directory (Electron).
   * When restoring from the data directory, it will take
   * the currently set server host into account so that it's possible
   * to store the authentication tokens for multiple servers
   * simultaneously without needing to log in again when
   * switching servers.
   */
  async function restoreJwt() {
    if (electronApi) {
      jwt.value = await electronApi.auth.getClientJwt.query()
    } else {
      jwt.value = window.localStorage.getItem(JWT_LOCAL_STORAGE_KEY)
    }
  }

  return {
    jwt,
    redirectPath,
    restoreJwt,
  }
})
