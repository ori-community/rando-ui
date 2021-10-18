import sanitizeHtml from 'sanitize-html'
import semver from 'semver'
import * as commonmark from 'commonmark'
import { EventBus } from '~/assets/lib/EventBus'

window.semver = semver

export const state = () => ({
  settings: {},
  settingsLoaded: false,
  currentVersion: '',
  availableReleases: null,
  updateDownloading: false,
  updateDownloadProgress: 0,
  launching: false,
  offlineMode: false,
  currentSeedPath: null,
  currentSupportBundleName: null,
  showUpdateAvailableDialog: false,
})

export const getters = {
  shouldShowVersion(state) {
    return version => {
      const updateToPrereleaseVersions = state.settingsLoaded && (state.settings.Flags.UpdateToPrereleaseVersions ?? false)
      const prerelease = semver.prerelease(version)
      return updateToPrereleaseVersions || prerelease === null
    }
  },
  isNewVersion(state, getters) {
    return version => {
      if (state.currentVersion === '' || state.currentVersion === 'develop') {
        return false
      }

      if (!getters.shouldShowVersion(version)) {
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
  latestAvailableRelease(state) {
    return state.availableReleases?.length > 0
      ? state.availableReleases[0]
      : null
  },
  latestAvailableVersion(state) {
    return state.latestAvailableRelease?.name
  },
  visibleReleases(state, getters) {
    return state.availableReleases?.filter(r => getters.shouldShowVersion(r.name))
  },
  latestVisibleRelease(state, getters) {
    return getters.visibleReleases?.length > 0
      ? getters.visibleReleases[0]
      : null
  },
  latestVisibleVersion(state, getters) {
    return getters.latestVisibleRelease?.name
  },
  updateAvailable(state, getters) {
    return state.latestVisibleRelease !== null && getters.isNewVersion(getters.latestVisibleVersion)
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
  setCurrentVersion(state, value) {
    state.currentVersion = value
  },
  setAvailableReleases(state, value) {
    state.availableReleases = value
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
  setLaunching(state, value) {
    state.launching = value
  },
  setCurrentSeedPath(state, value) {
    state.currentSeedPath = value
  },
  setCurrentSupportBundleName(state, value) {
    state.currentSupportBundleName = value
  },
}

let checkForUpdatesOncePromise = null

export const actions = {
  async checkForUpdates({ commit }) {
    try {
      commit('setCurrentVersion', await window.electronApi.invoke('updater.getVersion'))

      commit('setAvailableReleases', (await this.$axios.$get(`${process.env.UPDATE_PROXY_URL}/releases`))
        .filter(release => !release.draft && !release.prerelease)
        .sort((a, b) => semver.compareLoose(b.name, a.name))
        .map(release => {
          const parser = new commonmark.Parser()
          const writer = new commonmark.HtmlRenderer()

          return {
            ...release,
            bodyHtml: sanitizeHtml(writer.render(parser.parse(release.body))),
          }
        }))
    } catch (e) {
      commit('setOfflineMode', true)
      console.error(e)
    }
  },
  async checkForUpdatesOnce({ dispatch }) {
    await new Promise(resolve => {
      if (checkForUpdatesOncePromise === null) {
        checkForUpdatesOncePromise = dispatch('checkForUpdates')
      }

      checkForUpdatesOncePromise.finally(resolve)
    })
  },
  async downloadAndInstallUpdate({ commit, getters }) {
    if (getters.latestVisibleRelease) {
      commit('setShowUpdateAvailableDialog', false)
      commit('setUpdateDownloadProgress', 0)
      commit('setUpdateDownloading', true)

      window.electronApi.on('updater.downloadProgress', (event, progress) => {
        commit('setUpdateDownloadProgress', progress * 100)
      })
      await window.electronApi.invoke('updater.downloadAndInstallUpdate', {
        url: getters.latestVisibleRelease.assets.find(a => a.name === 'WotwRandoSetup.exe').browser_download_url,
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
