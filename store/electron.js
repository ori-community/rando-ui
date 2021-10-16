import sanitizeHtml from 'sanitize-html'
import semver from 'semver'
import * as commonmark from 'commonmark'
import { EventBus } from '~/assets/lib/EventBus'

export const state = () => ({
  settings: {},
  settingsLoaded: false,
  currentVersion: '',
  latestRelease: null, // contains new version string if available
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
  isNewVersion(state) {
    return version => {
      if (state.currentVersion === '' || state.currentVersion === 'develop') {
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
  updateAvailable(state, getters) {
    return state.latestRelease !== null && getters.isNewVersion(getters.latestVersion)
  },
  latestVersion(state) {
    return state.latestRelease?.name
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
  setLatestRelease(state, value) {
    state.latestRelease = value
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
  async checkForUpdates({ commit, state }) {
    try {
      commit('setCurrentVersion', await window.electronApi.invoke('updater.getVersion'))

      this.motd = sanitizeHtml((await this.$axios.$get(`${process.env.UPDATE_PROXY_URL}/motd/wotw`, {
        params: {
          version: state.currentVersion,
        },
      })).motd, {
        allowedClasses: {
          '*': ['mb-*'],
        },
      })

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

      if (state.availableReleases.length > 0) {
        commit('setLatestRelease', state.availableReleases[0])
      }
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
  async downloadAndInstallUpdate({ commit, state }) {
    commit('setShowUpdateAvailableDialog', false)
    commit('setUpdateDownloadProgress', 0)
    commit('setUpdateDownloading', true)

    window.electronApi.on('updater.downloadProgress', (event, progress) => {
      commit('setUpdateDownloadProgress', progress * 100)
    })
    await window.electronApi.invoke('updater.downloadAndInstallUpdate', {
      url: state.latestRelease.assets.find(a => a.name === 'WotwRandoSetup.exe').browser_download_url,
    })
  },
  async launch({ commit, state, dispatch }, { seedFile = null, forceLaunch = false }) {
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

      if (!forceLaunch && state.updateAvailable) {
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
