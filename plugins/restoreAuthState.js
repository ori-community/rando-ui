import { isElectron } from '~/assets/lib/isElectron'
import { getJwtStorageKey } from '~/assets/electron/getJwtStorageKey'

export default async ({ app }) => {
  if (isElectron()) {
    await app.store.dispatch('auth/setJwt', window.localStorage.getItem(await getJwtStorageKey()))
  } else {
    await app.store.dispatch('auth/setJwt', window.localStorage.getItem('auth.jwt'))
  }

  app.store.commit('auth/setRedirectPath', window.localStorage.getItem('auth.redirectPath'))
}
