import { WebSocketFactory } from '~/assets/lib/WebSocketFactory'

export const state = () => ({
  redirectPath: null,
  jwt: null,
})

export const getters = {

}

export const mutations = {
  setRedirectPath(state, redirectPath) {
    state.redirectPath = redirectPath

    if (redirectPath) {
      window.localStorage.setItem('auth.redirectPath', redirectPath)
    } else {
      window.localStorage.removeItem('auth.redirectPath')
    }
  },
  setJwt(state, jwt) {
    if (jwt) {
      this.$axios.setToken(jwt, 'Bearer')
      window.localStorage.setItem('auth.jwt', jwt)
      WebSocketFactory.jwt = jwt
    } else {
      this.$axios.setToken(false)
      window.localStorage.removeItem('auth.jwt')
      WebSocketFactory.jwt = null
    }
    state.jwt = jwt
  },
}

export const actions = {

}
