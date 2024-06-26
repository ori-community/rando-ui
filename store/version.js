import * as semver from 'semver'
import { renderMarkdown } from '~/assets/lib/markdown'

export const state = () => ({
  availableReleases: null,
})

export const getters = {
  shouldShowVersion(_state, _getter, rootState) {
    return version => {
      const updateToPrereleaseVersions = rootState.electron.settingsLoaded && (rootState.electron.settings['Flags.UpdateToPrereleaseVersions'] ?? false)
      const prerelease = semver.prerelease(version)
      return updateToPrereleaseVersions || prerelease === null
    }
  },
  latestAvailableRelease(state) {
    return state.availableReleases?.length > 0
      ? state.availableReleases[0]
      : null
  },
  latestAvailableReleaseWindowsDownload(_state, getters){
    return getters.latestVisibleRelease?.assets.find((a) => a.name === 'WotwRandoSetup.exe')
  },
  latestAvailableReleaseLinuxDownload(_state, getters){
    return getters.latestVisibleRelease?.assets.find((a) => a.name === 'WotwRando.tar.gz')
  },
  latestAvailableVersion(_state, getters) {
    return getters.latestAvailableRelease?.name
  },
  visibleReleases(state, getters) {
    return state.availableReleases?.filter(r => getters.shouldShowVersion(r.name))
  },
  latestVisibleRelease(_state, getters) {
    return getters.visibleReleases?.length > 0
      ? getters.visibleReleases[0]
      : null
  },
  latestVisibleVersion(_state, getters) {
    return getters.latestVisibleRelease?.name
  },
}

export const mutations = {
  setAvailableReleases(state, value) {
    state.availableReleases = value
  },
}

export const actions = {
  async updateAvailableReleases({ commit }) {
    try {
      commit(
        'setAvailableReleases',
        (await this.$axios.$get(`${process.env.UPDATE_PROXY_URL}/releases`))
          .filter((release) => !release.draft && !release.prerelease)
          .sort((a, b) => semver.compareLoose(b.name, a.name))
          .map((release) => ({
            ...release,
            bodyHtml: renderMarkdown(release.body),
          })),
      )
    } catch (e) {
      console.error(e)
      return false
    }
    return true
  },
}
