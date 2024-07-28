import {defineStore} from 'pinia'

const REDIRECT_PATH_LOCAL_STORAGE_KEY = 'auth.redirectPath'
const JWT_LOCAL_STORAGE_KEY = 'auth.jwt'

const isElectron = useIsElectron()

export const useAuthStore = defineStore('auth', {
  state: () => ({
    jwt: null as null | string,
    redirectPath: window.localStorage.getItem(REDIRECT_PATH_LOCAL_STORAGE_KEY) as null | string,
  }),
  actions: {
    /**
     * Restores the JWT token from localStorage (web) or
     * the data directory (Electron).
     * When restoring from the data directory, it will take
     * the currently set server host into account so that it's possible
     * to store the authentication tokens for multiple servers
     * simultaneously without needing to log in again when
     * switching servers.
     */
    async restoreJwt() {
      if (isElectron) {
        // TODO: Make tRPC call to get the stored JWT token or null
      } else {
        this.jwt = window.localStorage.getItem(JWT_LOCAL_STORAGE_KEY)
      }
    },
  },
})

watch(() => useAuthStore().redirectPath, (value) => {
  if (value) {
    window.localStorage.setItem(REDIRECT_PATH_LOCAL_STORAGE_KEY, value)
  } else {
    window.localStorage.removeItem(REDIRECT_PATH_LOCAL_STORAGE_KEY)
  }
})

watch(() => useAuthStore().jwt, (value) => {
  // Persist the new token
  if (isElectron) {
    // TODO: Make tRPC call to persist the new JWT
  } else {
    if (value) {
      window.localStorage.setItem(JWT_LOCAL_STORAGE_KEY, value)
    } else {
      window.localStorage.removeItem(JWT_LOCAL_STORAGE_KEY)
    }
  }

  // Push the token to the Axios HTTP client
  const axios = useAxios()

  if (value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${value}`
  } else {
    delete axios.defaults.headers.common['Authorization']
  }

  // TODO: Push the token to WebSocket client
})
