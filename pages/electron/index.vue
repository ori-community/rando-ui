<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="9" order-md="0" order="1">
        <template v-if="offlineMode">
          <div class="pa-6 text-center">
            <v-icon size="64">mdi-cloud-off-outline</v-icon>
            <div>
              You appear to be offline<br />
              <span class="text-lurk">(or we broke the server)</span>
            </div>
          </div>
        </template>
        <template v-else>
          <v-scroll-x-transition>
            <v-card v-if="!!motd" class="mb-6 motd" color="background lighten-2">
              <v-card-text class="motd-text">
                <div v-html="motd" />
              </v-card-text>
              <img class="motd-ori" alt="" src="~/assets/images/ori_lurk.png" />
            </v-card>
          </v-scroll-x-transition>

          <v-scroll-x-transition>
            <div v-if="!!motd && !!visibleReleases">
              <v-card v-for="release in visibleReleases" :key="release.id" class="release mb-2">
                <v-card-title class="d-block">
                  Version {{ release.name }}
                  <v-chip v-if="isNewVersion(release.name)" class="ml-2" small color="accent">New</v-chip>
                </v-card-title>
                <v-card-text class="release-changelog">
                  <div v-html="release.bodyHtml" />
                  <div class="d-flex justify-end">
                    <div class="d-flex align-end">
                      <template v-if="!!getSetupAssetFromRelease(release)">
                        <v-btn
                          :disabled="updateDownloading"
                          text
                          x-small
                          class="install-button mr-3"
                          @click="downloadAndInstallUpdate(release)"
                        >
                          <template v-if="isNewVersion(release.name)">Install</template>
                          <template v-else-if="release.name === currentVersion">Re-install</template>
                          <template v-else>Downgrade</template>
                        </v-btn>
                        <div class="text-caption grey--text mr-3 d-inline">
                          {{ getSetupAssetFromRelease(release).download_count }}
                          <v-icon small color="grey">mdi-download-outline</v-icon>
                        </div>
                      </template>
                      <span class="text-caption grey--text">
                        {{ formatDateRelative(release.published_at) }}
                      </span>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </v-scroll-x-transition>
        </template>
      </v-col>
      <v-col cols="12" md="3" order-md="1" order="0">
        <div class="sticky">
          <v-card :color="updateAvailable ? `warning darken-1` : `background lighten-1`" class="pa-4">
            <h3>Version: {{ currentVersion }}</h3>
            <template v-if="updateDownloading">
              Downloading {{ !!updateReleaseName ? `version ${updateReleaseName}` : `update` }}...
              <v-progress-linear class="mt-3" :value="updateDownloadProgress" />
            </template>
            <template v-else-if="currentVersion === 'develop'">
              You are running a development build. Download the latest stable version to get automatic updates.
            </template>
            <template v-else-if="updateAvailable">
              Version {{ latestVisibleVersion }} is available!
              <v-btn class="mt-3" depressed block @click="downloadAndInstallUpdate()">Install update</v-btn>
            </template>
            <template v-else> You are running the latest version. </template>
          </v-card>

          <v-btn
            x-large
            color="accent"
            block
            class="mt-6"
            :class="{ 'bottom-border-radius-0': currentSeedPath !== null }"
            :loading="launching"
            @click="launch()"
          >
            <img class="launch-icon" src="../../assets/images/launch.png" alt="" />
            Launch
          </v-btn>
          <v-card v-if="currentSeedPath !== null" class="pa-2 text-center top-border-radius-0 current-seed-path">
            {{ currentSeedPathBasename }}
          </v-card>

          <div class="text-center mt-5">
            <wotw-new-game-menu block />
          </div>

          <v-btn text block class="mt-3" @click="openWiki">
            <v-icon left>mdi-book-outline</v-icon>
            Read the Wiki
          </v-btn>

          <div class="py-4 text-center hoverable">
            <v-tooltip bottom>
              <span>Open seeds directory</span>
              <template #activator="{ on }">
                <v-btn icon v-on="on" @click="openSeedsDirectory">
                  <v-icon>mdi-folder-eye-outline</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip bottom>
              <span>Open randomizer directory</span>
              <template #activator="{ on }">
                <v-btn icon v-on="on" @click="openRandomizerDirectory">
                  <v-icon>mdi-folder-cog-outline</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip bottom>
              <span>Create support bundle</span>
              <template #activator="{ on }">
                <v-btn icon :loading="supportBundleLoading" v-on="on" @click="createSupportBundle">
                  <v-icon>mdi-bug-outline</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip bottom>
              <span>GitHub</span>
              <template #activator="{ on }">
                <v-btn icon v-on="on" @click="openGitHub">
                  <v-icon>mdi-github</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip bottom>
              <span>Discord</span>
              <template #activator="{ on }">
                <v-btn icon v-on="on" @click="openDiscord">
                  <v-icon>mdi-discord</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import { mapGetters, mapMutations, mapState } from 'vuex'
  import sanitizeHtml from 'sanitize-html'
  import { parse } from 'date-fns'
  import { formatsDates } from '~/assets/lib/formatsDates'

  export default {
    name: 'Index',
    mixins: [formatsDates],
    data: () => ({
      motd: '',
      supportBundleLoading: false,
    }),
    head: () => ({
      title: 'Home',
      meta: [{ hid: 'robots', name: 'robots', content: 'noindex' }],
    }),
    computed: {
      ...mapState('user', ['user']),
      ...mapState('electron', [
        'settings',
        'settingsLoaded',
        'currentVersion',
        'updateDownloading',
        'updateReleaseName',
        'updateDownloadProgress',
        'launching',
        'offlineMode',
        'currentSeedPath',
        'currentSupportBundleName',
        'showUpdateAvailableDialog',
      ]),
      ...mapState('multiverseState', ['multiverses']),
      ...mapGetters('electron', ['updateAvailable', 'currentSeedPathBasename', 'isNewVersion']),
      ...mapGetters('version', ['latestVisibleVersion', 'visibleReleases']),
    },
    watch: {
      currentVersion: {
        immediate: true,
        async handler(version) {
          if (version) {
            this.motd = sanitizeHtml(
              (
                await this.$axios.$get(`${process.env.UPDATE_PROXY_URL}/motd/wotw`, {
                  params: {
                    version,
                  },
                })
              ).motd,
              {
                allowedClasses: {
                  '*': ['mb-*'],
                },
              },
            ).replaceAll(/#(\d+:\d+)#/g, (substring, utcTime) => {
              const time = parse(`${utcTime}+00`, 'HH:mmx', new Date())
              return this.formatDateObject(time, 'p')
            })
          }
        },
      },
    },
    async mounted() {
      // We might already have a seed path from launching...
      if (this.currentSeedPath === null) {
        this.$store.commit(
          'electron/setCurrentSeedPath',
          await window.electronApi.invoke('launcher.getCurrentSeedPath'),
        )
      }
    },
    methods: {
      ...mapMutations('electron', ['setCurrentSeedPath']),
      getSetupAssetFromRelease(release) {
        return release.assets.find((a) => a.name === 'WotwRandoSetup.exe')
      },
      async downloadAndInstallUpdate(release = null) {
        if (release) {
          const url = this.getSetupAssetFromRelease(release)?.browser_download_url
          if (url) {
            await this.$store.dispatch('electron/downloadAndInstallUpdate', { url, releaseName: release.name })
          }
        } else {
          await this.$store.dispatch('electron/downloadAndInstallUpdate')
        }
      },
      async launch(seedFile = null, forceLaunch = false) {
        await this.$store.dispatch('electron/launch', {
          seedFile,
          forceLaunch,
        })
      },
      openWiki() {
        window.electronApi.invoke('launcher.openWiki')
      },
      openRandomizerDirectory() {
        window.electronApi.invoke('launcher.openRandomizerDirectory')
      },
      openSeedsDirectory() {
        window.electronApi.invoke('launcher.openSeedsDirectory')
      },
      openGitHub() {
        window.electronApi.invoke('launcher.openGitHub')
      },
      openDiscord() {
        window.electronApi.invoke('launcher.openDiscord')
      },
      async createSupportBundle() {
        this.supportBundleLoading = true

        try {
          const supportBundleName = await window.electronApi.invoke('crash.createSupportBundle')
          window.electronApi.invoke('crash.showSupportBundleInExplorer', supportBundleName)
        } catch (e) {
          console.error(e)
        }

        this.supportBundleLoading = false
      },
    },
  }
</script>

<style lang="scss" scoped>
  .launch-icon {
    height: 2.25em;
    width: auto;
    margin-right: 0.25em;
    margin-left: -0.5em;
  }

  .hoverable {
    opacity: 0.5;
    transition: opacity 300ms;

    &:hover {
      opacity: 1;
    }
  }

  .motd {
    position: relative;

    .motd-text {
      padding-right: 64px;
    }

    .motd-ori {
      height: 64px;
      width: 64px;
      position: absolute;
      opacity: 0.5;
      pointer-events: none;
      transform: translateY(8%);
      bottom: 0;
      right: 0;
    }
  }

  .top-border-radius-0 {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }

  .bottom-border-radius-0 {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  .current-seed-path {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border-top-width: 0;
    color: rgba(255, 255, 255, 0.5);
  }

  .text-lurk {
    opacity: 0.2;
  }

  .sticky {
    position: sticky;
    top: 1em;
  }
</style>

<style lang="scss">
  .release-changelog {
    h1,
    h2,
    h3,
    h4,
    h5 {
      font-size: 1.3em;
      margin-bottom: 0.4em;
    }

    ul:not(:last-of-type) {
      margin-bottom: 0.75em;
    }
  }

  .release {
    .install-button {
      opacity: 0;
      transform: translateX(8px);
      transition: opacity 200ms, transform 200ms;
    }

    &:hover {
      .install-button {
        opacity: 1;
        transform: translateX(0);
      }
    }
  }
</style>
