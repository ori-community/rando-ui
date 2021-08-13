export const state = () => ({
  user: null,
  userLoaded: false,
})

export const getters = {
  isLoggedIn(state) {
    return state.user !== null
  },
}

export const mutations = {
  setUser(state, user) {
    state.user = user
    state.userLoaded = true
  },
}

export const actions = {
  async updateUser({ commit }) {
    try {
      const user = await this.$axios.$get('/users/me/info')
      commit('setUser', user)
    } catch (e) {
      console.error(e)
      commit('setUser', null)
    }
  },
}
