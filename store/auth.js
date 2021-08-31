export const state = () => ({
  redirectRoute: null,
  jwt: null,
})

export const getters = {

}

export const mutations = {
  setRedirectRoute(state, redirectRoute) {
    state.redirectRoute = redirectRoute
  },
  setJwt(state, jwt) {
    state.jwt = jwt
  },
}

export const actions = {

}
