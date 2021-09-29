export const state = () => ({
  lastMultiverseId: null,
  lastSeedgenResult: null,
})

export const getters = {

}

export const mutations = {
  setLastMultiverseId(state, { id, seedgenResult }) {
    state.lastMultiverseId = id
    state.lastSeedgenResult = seedgenResult
  },
}

export const actions = {

}
