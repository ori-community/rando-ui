import {defineStore} from 'pinia'

const REDIRECT_PATH_LOCAL_STORAGE_KEY = 'auth.redirectPath'
const JWT_LOCAL_STORAGE_KEY = 'auth.jwt'

const isElectron = useIsElectron()
const electronApi = isElectron ? useElectronApi() : null

export const useAuthStore = defineStore('auth', () => {
  const userStore = useUserStore()

  const jwt = ref<null | string>(null)
  const redirectPath = ref<null | string>(window.localStorage.getItem(REDIRECT_PATH_LOCAL_STORAGE_KEY))

  watch(redirectPath, (value) => {
    if (value) {
      window.localStorage.setItem(REDIRECT_PATH_LOCAL_STORAGE_KEY, value)
    } else {
      window.localStorage.removeItem(REDIRECT_PATH_LOCAL_STORAGE_KEY)
    }
  })

  async function setJwt(token: string | null) {
    jwt.value = token

    // Push the token to the Axios HTTP client
    const {axios} = useAxios()

    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }

    // TODO: Push the token to WebSocket client

    // Persist the new token
    if (electronApi) {
      await electronApi.auth.setClientJwt.query({jwt: token})
    } else {
      if (token) {
        window.localStorage.setItem(JWT_LOCAL_STORAGE_KEY, token)
      } else {
        window.localStorage.removeItem(JWT_LOCAL_STORAGE_KEY)
      }
    }

    await userStore.updateUser()
  }

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
      await setJwt(await electronApi.auth.getClientJwt.query())
    } else {
      await setJwt(window.localStorage.getItem(JWT_LOCAL_STORAGE_KEY))
    }
  }

  return {
    jwt: computed(() => jwt.value),
    setJwt,
    redirectPath,
    restoreJwt,
  }
})
