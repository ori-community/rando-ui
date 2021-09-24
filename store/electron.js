export const state = () => ({
  settings: {},
  settingsLoaded: false,
})

export const getters = {}

export const mutations = {
  setSettings(state, settings) {
    state.settings = settings
    state.settingsLoaded = true
  },
}

export const actions = {}
