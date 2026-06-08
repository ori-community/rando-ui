import axios from "axios"
import semver from "semver"

export type Release = {
  version: string,
  isNew: boolean,
  isCurrent: boolean,
  isPrerelease: boolean,
  releaseTimestamp: Date,
  downloads: number,
  notes: string,
  urls: {
    windows: {
      installer: string,
    },
    linux: {
      appimage: string,
      portable: string,
    }
  }
}

type GitHubRelease = {
  name: string,
  published_at: string,
  body: string,
  assets: {
    browser_download_url: string,
    name: string,
    download_count: number,
  }[]
}

let fetchedReleases = false
const releases = ref<Release[] | null>(null)

async function fetchReleases() {
  const runtimeConfig = useRuntimeConfig()
  const githubReleases: GitHubRelease[] = (await axios.get(runtimeConfig.public.releasesUrl)).data
  const electronApi = useElectronApi()
  const currentVersionString = await electronApi?.updater.getVersion.query() ?? null
  const currentVersion = currentVersionString === null ? null : semver.parse(currentVersionString)

  releases.value = githubReleases
    .map((release): Release | null => {
      const version = semver.parse(release.name)

      if (version === null) {
        return null
      }

      const windowsInstallerUrl = release.assets.find(a => a.name === "WotwRandomizerSetup.exe")?.browser_download_url ?? null
      const linuxAppImageUrl = release.assets.find(a => a.name === "WotwRandomizer.AppImage")?.browser_download_url ?? null
      const linuxPortableUrl = release.assets.find(a => a.name === "WotwRandomizer.tar.gz")?.browser_download_url ?? null

      if (windowsInstallerUrl === null || linuxAppImageUrl === null || linuxPortableUrl === null) {
        return null
      }

      const semverComparison = currentVersion === null
        ? null
        : semver.compare(version, currentVersion)

      return {
        version: release.name,
        notes: release.body,
        releaseTimestamp: new Date(release.published_at),
        downloads: release.assets.reduce((acc, asset) => acc + asset.download_count, 0),
        isNew: semverComparison !== null
          ? semverComparison > 0
          : false,
        isCurrent: semverComparison !== null
          ? semverComparison === 0
          : false,
        isPrerelease: version.prerelease.length > 0,
        urls: {
          windows: {
            installer: windowsInstallerUrl,
          },
          linux: {
            appimage: linuxAppImageUrl,
            portable: linuxPortableUrl,
          }
        },
      }
    })
    .filter(release => release !== null)
    .toSorted((a, b) => semver.rcompare(a.version, b.version))
}

export function useReleases() {
  if (!fetchedReleases) {
    fetchedReleases = true
    fetchReleases()
      .catch(error => console.error(error))
  }

  const settingsStore = useSettingsStore()
  const includePrereleases = computed(() => settingsStore.UpdateToPrereleaseVersions)
  const availableReleases = computed(() => {
    if (releases.value === null) {
      return null
    }

    if (includePrereleases.value) {
      return releases.value
    }

    return releases.value.filter(r => !r.isPrerelease)
  })
  const availableUpdate = computed(() => availableReleases.value?.find(r => r.isNew) ?? null)

  return {releases, availableReleases, availableUpdate}
}
