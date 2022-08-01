import { isElectron } from '~/assets/lib/isElectron'
import { getJwtStorageKey } from '~/assets/electron/getJwtStorageKey'

export default async ({ app }) => {
  if (isElectron()) {
    app.store.commit('auth/restoreJwt', window.localStorage.getItem(await getJwtStorageKey()))
  } else {
    app.store.commit('auth/restoreJwt', window.localStorage.getItem('auth.jwt'))
  }

  app.store.commit('auth/setRedirectPath', window.localStorage.getItem('auth.redirectPath'))
}
