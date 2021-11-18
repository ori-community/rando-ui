import Vue from 'vue'

export const state = () => ({
  uberStateCache: { },
})

export const getters = {
  value(moduleState) {
    return (group, state) => {
      return moduleState.uberStateCache[`${group}:${state}`] ?? null
    }
  },
}

export const mutations = {
  setUberState(moduleState, { group, state, value }) {
    Vue.set(moduleState.uberStateCache, `${group}:${state}`, value)
  },
}

export const actions = {
  async updateUberStates({commit}, states) {
    const values = await window.electronApi.invoke('uberState.getMultiple', states)

    for (let i = 0; i < states.length; i++) {
      const uberState = states[i]
      commit('setUberState', {
        ...uberState,
        value: values[i]
      })
    }
  },
}
