import WebworkerPromise from 'webworker-promise/lib'
import HeaderParserWorker from '~/assets/lib/workers/headerParser.worker'

export const state = () => ({
  /** @var {SeedgenLibrary|null} library */
  library: null,

  /** @var {{string: ParsedHeader}} parsedHeaders */
  parsedHeadersByName: {},
})

export const getters = {

}

export const mutations = {
  setLibrary(state, library) {
    state.library = library
  },
  setParsedHeadersByName(state, parsedHeadersByName) {
    state.parsedHeadersByName = parsedHeadersByName
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
    const parsedHeadersByName = await worker.postMessage({
      headers: Object.values(state.library.headers)
    })

    commit('setParsedHeadersByName', parsedHeadersByName)
  }
}
