export const state = () => ({
  /** @var {SeedgenLibrary|null} library */
  library: null,
})

export const getters = {

}

export const mutations = {
  setLibrary(state, library) {
    state.library = library
  },
}

export const actions = {
  async fetchLibrary({ commit }) {
    /** @var {SeedgenLibrary} library */
    const library = await this.$axios.$get('/seedgen/library')
    commit('setLibrary', library)
  }
}
