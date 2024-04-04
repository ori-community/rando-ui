import { isElectron } from '~/assets/lib/isElectron'
import { generateClientJwt } from '~/assets/electron/generateClientJwt'

export const state = () => ({
  user: null,
  userLoaded: false,
})

export const getters = {
  isLoggedIn(state) {
    return state.user !== null
  },
  isDeveloper(state) {
    return !!state.user?.isDeveloper
  }
}

export const mutations = {
  setUser(state, user) {
    state.user = user
    state.userLoaded = true
  },
  setCurrentMultiverseId(state, currentMultiverseId) {
    if (state.user) {
      state.user.currentMultiverseId = currentMultiverseId
    }
  },
}

export const actions = {
  async updateUser({ commit }) {
    try {
      const user = await this.$axios.$get('/users/me/info')
      commit('setUser', user)

      if (isElectron() && !!user) {
        if (await window.electronApi.invoke('auth.getClientJwt') === null) {
          await generateClientJwt(this.$axios)
        }
      }
    } catch (e) {
      console.warn(e)
      commit('setUser', null)
    }
  },
}
