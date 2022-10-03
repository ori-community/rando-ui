import WebworkerPromise from 'webworker-promise/lib'
import HeaderParserWorker from '~/assets/lib/workers/headerParser.worker'

export const state = () => ({
  /** @var {SeedgenLibrary|null} library */
  library: null,
  parsedHeaders: [],
})

export const getters = {

}

export const mutations = {
  setLibrary(state, library) {
    state.library = library
  },
  setParsedHeaders(state, parsedHeaders) {
    state.parsedHeaders = parsedHeaders
  },
}

export const actions = {
  async fetchLibrary({ commit, dispatch }) {
    /** @var {SeedgenLibrary} library */
    const library = await this.$axios.$get('/seedgen/library')
    commit('setLibrary', library)

    dispatch('parseLibraryHeaders')
  },
  async parseLibraryHeaders({ commit, state }) {
    const worker = new WebworkerPromise(new HeaderParserWorker())
    const parsedHeaders = await worker.postMessage({
      headers: Object.values(state.library.headers)
    })

    commit('setParsedHeaders', parsedHeaders)
  }
}
