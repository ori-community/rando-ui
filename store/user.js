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

      if (isElectron()) {
        if (user) {
          if (!await window.electronApi.invoke('auth.hasClientJwt')) {
            await generateClientJwt(this.$axios)
          }
        }
      }
    } catch (e) {
      console.error(e)
      commit('setUser', null)
    }
  },
}
