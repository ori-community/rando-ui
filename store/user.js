export const state = () => ({
  user: null
})

export const getters = {
  isLoggedIn(state) {
    return state.user !== null
  },
}

export const mutations = {
  setUser(state, user) {
    state.user = user
  }
}

export const actions = {
  async updateUser({commit}) {
    const user = await this.$axios.$get('/users/me/info')
    commit('setUser', user)
  }
}
