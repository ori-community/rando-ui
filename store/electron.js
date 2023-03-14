import semver from 'semver'
import { EventBus } from '~/assets/lib/EventBus'
import { hasOwnProperty } from '~/assets/lib/hasOwnProperty'

export const state = () => ({
  settings: {},
  settingsLoaded: false,
  currentVersion: '',
  availableReleases: null,
  updateDownloading: false,
  updateReleaseName: null,
  updateDownloadProgress: 0,
  launching: false,
  offlineMode: false,
  currentSeedPath: null,
  currentSupportBundleName: null,
  showUpdateAvailableDialog: false,
  localTrackerRunning: false,
  randoIpcConnected: false,
})

export const getters = {
  isNewVersion(state, getters, rootState, rootGetters) {
    return version => {
      if (state.currentVersion === '' || state.currentVersion === 'develop') {
        return false
      }
      if (!rootGetters['version/shouldShowVersion'](version)) {
        return false
      }

      try {
        return semver.gt(version, state.currentVersion, true)
      } catch (e) {
        console.error(e)
        return false
      }
    }
  },
  updateAvailable(state, getters, rootState, rootGetters) {
    if (rootGetters['version/latestVisibleVersion']) {
      return rootState.version.latestVisibleRelease !== null && getters.isNewVersion(rootGetters['version/latestVisibleVersion'])
    }
  },
  currentSeedPathBasename(state) {
    if (!state.currentSeedPath) {
      return null
    }

    const parts = state.currentSeedPath.split(/[/\\]/)
    return parts[parts.length - 1]
  },
}

export const mutations = {
  setSettings(state, settings) {
    state.settings = settings
    state.settingsLoaded = true
  },
  setSetting(state, { key, value }) {
    if (!hasOwnProperty(state.settings, key)) {
      throw new Error(`Tried to set setting '${key}' that does not exist`)
    }

    state.settings[key] = value
  },
  setCurrentVersion(state, value) {
    state.currentVersion = value
  },
  setOfflineMode(state, value) {
    state.offlineMode = value
  },
  setShowUpdateAvailableDialog(state, value) {
    state.showUpdateAvailableDialog = value
  },
  setUpdateDownloadProgress(state, value) {
    state.updateDownloadProgress = value
  },
  setUpdateDownloading(state, value) {
    state.updateDownloading = value
  },
  setUpdateReleaseName(state, value) {
    state.updateReleaseName = value
  },
  setLaunching(state, value) {
    state.launching = value
  },
  setCurrentSeedPath(state, value) {
    state.currentSeedPath = value
  },
  setCurrentSupportBundleName(state, value) {
    state.currentSupportBundleName = value
  },
  setLocalTrackerRunning(state, value) {
    state.localTrackerRunning = value
  },
  setRandoIpcConnected(state, value) {
    state.randoIpcConnected = value
  },
}

let checkForUpdatesOncePromise = null

export const actions = {
  async setSetting({ commit }, { key, value }) {
    commit('setSetting', { key, value })
    await window.electronApi.invoke('settings.setSetting', { key, value })
  },
  async checkForUpdates({ dispatch, commit }) {
    try {
      commit('setCurrentVersion', await window.electronApi.invoke('updater.getVersion'))
      dispatch('version/updateAvailableReleases', null, { root: true })

    } catch (e) {
      commit('setOfflineMode', true)
      console.error(e)
    }
  },
  async checkForUpdatesOnce({ dispatch }) {
    await new Promise((resolve) => {
      if (checkForUpdatesOncePromise === null) {
        checkForUpdatesOncePromise = dispatch('checkForUpdates')
      }

      checkForUpdatesOncePromise.finally(resolve)
    })
  },
  async downloadAndInstallUpdate({ commit, rootGetters }, { url = null, releaseName = null } = {}) {
    if (rootGetters['version/latestVisibleRelease']) {
      commit('setShowUpdateAvailableDialog', false)
      commit('setUpdateDownloadProgress', 0)
      commit('setUpdateDownloading', true)

      window.electronApi.on('updater.downloadProgress', (event, progress) => {
        commit('setUpdateDownloadProgress', progress * 100)
      })

      let resolvedUrl = url

      if (!resolvedUrl) {
        const release = rootGetters['version/latestAvailableReleaseExe']
        resolvedUrl = release.browser_download_url
        commit('setUpdateReleaseName', rootGetters['version/latestVisibleVersion'])
      } else {
        commit('setUpdateReleaseName', releaseName)
      }

      await window.electronApi.invoke('updater.downloadAndInstallUpdate', {
        url: resolvedUrl,
      })
    }
  },
  async launch({ commit, state, getters, dispatch }, { seedFile = null, forceLaunch = false } = {}) {
    if (state.launching) {
      return
    }

    commit('setShowUpdateAvailableDialog', false)
    commit('setLaunching', true)

    try {
      if (seedFile !== null) {
        await window.electronApi.invoke('launcher.setCurrentSeedPath', seedFile)
      }

      if (!forceLaunch) {
        await dispatch('checkForUpdatesOnce')
      }

      if (!forceLaunch && getters.updateAvailable && !window.electronApi.invoke('launcher.isRandomizerRunning')) {
        commit('setShowUpdateAvailableDialog', true)
      } else {
        await window.electronApi.invoke('launcher.launch', seedFile)
      }
    } catch (e) {
      console.error(e)
      EventBus.$emit('main.error', e)
    }

    commit('setLaunching', false)
  },
}
