import * as commonmark from 'commonmark'
import semver from 'semver'
import sanitizeHtml from 'sanitize-html'

export const state = () => ({
  availableReleases: null,
})

export const getters = {
  shouldShowVersion(state, getter, rootState) {
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
  latestAvailableReleaseExe(state, getters){
    return getters.latestVisibleRelease?.assets.find((a) => a.name === 'WotwRandoSetup.exe')
  },
  latestAvailableVersion(state, getters) {
    return getters.latestAvailableRelease?.name
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
          .map((release) => {
            const parser = new commonmark.Parser()
            const writer = new commonmark.HtmlRenderer()

            return {
              ...release,
              bodyHtml: sanitizeHtml(writer.render(parser.parse(release.body))),
            }
          }),
      )
    } catch (e) {
      console.error(e)
      return false
    }
    return true
  },
}
