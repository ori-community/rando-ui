<template>
  <v-container>
    <v-row>
      <v-col cols='12' md='9' order-md='0' order='1'>
        <template v-if='offlineMode'>
          <div class='pa-6 text-center'>
            <v-icon size='64'>mdi-cloud-off-outline</v-icon>
            <div>
              You appear to be offline<br>
              <span class='text-lurk'>(or we broke the server)</span>
            </div>
          </div>
        </template>
        <template v-else>
          <v-scroll-x-transition>
            <v-card v-if='!!motd' class='mb-6 motd' color='background lighten-2'>
              <v-card-text class='motd-text' v-html='motd' />
              <img class='motd-ori' src='~/assets/images/ori_lurk.png'>
            </v-card>
          </v-scroll-x-transition>

          <v-scroll-x-transition group>
            <v-card v-for='release in availableReleases' :key='release.id' class='mb-2'>
              <v-card-title>Version {{ release.name }}
                <v-chip v-if='isNewVersion(release.name)' class='ml-2' small color='accent'>New</v-chip>
              </v-card-title>
              <v-card-text class='release-changelog' v-html='release.bodyHtml' />
            </v-card>
          </v-scroll-x-transition>
        </template>
      </v-col>
      <v-col cols='12' md='3' order-md='1' order='0'>
        <div class='sticky'>
          <v-card :color='updateAvailable ? `warning darken-4` : `background lighten-1`' class='pa-4'>
            <h3>Version: {{ currentVersion }}</h3>
            <template v-if='currentVersion === "develop"'>
              You are running a development build. Download the latest stable version
              to get automatic updates.
            </template>
            <template v-else-if='updateAvailable'>
              Version {{ latestVersion }} is available!

              <div v-if='updateDownloading'>
                <v-progress-linear class='mt-3' :value='updateDownloadProgress' />
              </div>
              <v-btn v-else class='mt-3' depressed block @click='downloadAndInstallUpdate'>Install update</v-btn>
            </template>
            <template v-else>
              You are running the latest version.
            </template>
          </v-card>

          <v-btn
            x-large
            color='accent'
            block
            class='mt-6'
            :class='{"bottom-border-radius-0": currentSeedPath !== null}'
            :loading='launching'
            @click='launch()'
          >
            <img class='launch-icon' src='../../assets/images/launch.png' alt=''>
            Launch
          </v-btn>
          <v-card v-if='currentSeedPath !== null' class='pa-2 text-center top-border-radius-0 current-seed-path'>
            {{ currentSeedPathBasename }}
          </v-card>

          <div class='text-center mt-5'>
            <wotw-new-game-menu block />
          </div>

          <v-btn text block class='mt-3' @click='openWiki'>
            <v-icon left>mdi-book-outline</v-icon>
            Read the Wiki
          </v-btn>

          <div class='py-4 text-center hoverable'>
            <v-tooltip bottom>
              <span>Open randomizer directory</span>
              <template #activator='{on}'>
                <v-btn icon v-on='on' @click='openRandomizerDirectory'>
                  <v-icon>mdi-folder-eye-outline</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip bottom>
              <span>GitHub</span>
              <template #activator='{on}'>
                <v-btn icon v-on='on' @click='openGitHub'>
                  <v-icon>mdi-github</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip bottom>
              <span>Discord</span>
              <template #activator='{on}'>
                <v-btn icon v-on='on' @click='openDiscord'>
                  <v-icon>mdi-discord</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-dialog :value='currentCrashZipName !== null' max-width='600' persistent>
      <v-card>
        <div class='pa-6'>
          <h1 class='text-center'>Uh oh!</h1>
          <h3 class='text-center mb-4'>Something went oribly wrong</h3>

          <div>
            It seems like the game crashed... We collected some information and important files that would help us
            to find the issue. Please reach out to one of the developers on our Discord and send them the file.
          </div>

          <div class='text-center my-8'>
            <code class='title'>{{ currentCrashZipName }}</code>
          </div>

          <div class='d-flex justify-end'>
            <v-btn text depressed @click='currentCrashZipName = null'>
              Close
            </v-btn>
            <v-btn depressed color='accent' class='ml-2' @click='showCrashZipInExplorer'>
              Show in Explorer
            </v-btn>
          </div>
        </div>
        <img class='crash-ori' src='~/assets/images/ori_sus.png' alt=''>
      </v-card>
    </v-dialog>

    <v-dialog v-model='showUpdateAvailableDialog' max-width='500' persistent>
      <v-card>
        <v-card-title>Update available ({{ latestVersion }})</v-card-title>
        <v-card-text>
          An update for the randomizer is ready to be downloaded and installed.
          We recommend to always play on the latest version.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click='launch(null, true)' class='mr-1'>
            Launch anyway
          </v-btn>
          <v-btn depressed color='accent' @click='downloadAndInstallUpdate'>
            Install update
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model='shouldShowImportInfoDialog' max-width='600' persistent>
      <v-card class='pa-6'>
        <h1 class='text-center mb-4'>Hi there! Welcome to 1.0</h1>

        <div class='text-center'>
          This is our biggest release yet. Thank you all for having played the
          beta versions of the randomizer. Enjoy the update!
        </div>

        <div class='py-10 text-center'>
          <img width='64' src='~/assets/images/ori_glow.png'>
        </div>

        <h2>Important changes</h2>
        <ul>
          <li>We <b>imported your old settings</b> and <b>removed</b> the old randomizer. There may be some files left
            in your old randomizer folder, which you can delete if you want.
          </li>
          <li>The randomizer is now installed like any other application. Start it through the <b>Start Menu</b>,
            uninstall in in the Windows Settings app.
          </li>
          <li>Generate and play seeds <b>directly in the launcher</b>.</li>
          <li>You now need to <b>log in</b> to the launcher to play online games</li>
          <li>Online games have <b>Multiverses</b>. To play Co-Op, play in the same World. To play Multiworld, create
            multiple worlds in the same Universe.
          </li>
          <li>Configure <b>Controller and Keyboard rebindings</b> interactively in the launcher settings.</li>
        </ul>

        <v-btn class='mt-8' block depressed color='accent' @click='shouldShowImportInfoDialog = false'>
          Let's go
        </v-btn>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
  import { mapState } from 'vuex'
  import semver from 'semver'
  import sanitizeHtml from 'sanitize-html'
  import * as commonmark from 'commonmark'
  import { generateClientJwt } from '~/assets/electron/generateClientJwt'

  export default {
    name: 'Index',
    data: () => ({
      currentVersion: '',
      latestRelease: null, // contains new version string if available
      updateDownloading: false,
      updateDownloadProgress: 0,
      launching: false,
      shouldShowImportInfoDialog: false,
      availableReleases: null,
      offlineMode: false,
      currentSeedPath: null,
      motd: '',
      currentCrashZipName: null,
      updateCheckPromise: null,
      showUpdateAvailableDialog: false,
    }),
    head: () => ({
      title: 'Home',
      meta: [
        { hid: 'robots', name: 'robots', content: 'noindex' },
      ],
    }),
    computed: {
      ...mapState({
        user: state => state.user.user,
        settings: state => state.electron.settings,
        settingsLoaded: state => state.electron.settingsLoaded,
      }),
      ...mapState('multiverseState', ['multiverses']),
      updateAvailable() {
        return this.latestRelease !== null && this.isNewVersion(this.latestVersion)
      },
      latestVersion() {
        return this.latestRelease?.name
      },
      currentSeedPathBasename() {
        if (!this.currentSeedPath) {
          return null
        }

        const parts = this.currentSeedPath.split(/[/\\]/)
        return parts[parts.length - 1]
      },
    },
    watch: {
      $route: {
        immediate: true,
        async handler(route) {
          if (route.query.seedFile) {
            await this.$router.replace({ query: {} })
            this.currentSeedPath = route.query.seedFile
            await this.launch(route.query.seedFile)
          }

          if (route.query.crashZipName) {
            await this.$router.replace({ query: {} })
            this.currentCrashZipName = route.query.crashZipName
          }
        },
      },
      user: {
        immediate: true,
        async handler(user) {
          if (user) {
            if (!await window.electronApi.invoke('auth.hasClientJwt')) {
              await generateClientJwt(this.$axios)
            }
          }
        },
      },
    },
    async mounted() {
      this.shouldShowImportInfoDialog = await window.electronApi.invoke('settings.shouldShowImportInfoDialog')
      this.currentSeedPath = await window.electronApi.invoke('launcher.getCurrentSeedPath')
      await this.checkForUpdatesOnce()
    },
    methods: {
      async checkForUpdatesOnce() {
        await new Promise(resolve => {
          if (this.updateCheckPromise === null) {
            this.updateCheckPromise = this.checkForUpdates()
          }

          this.updateCheckPromise.finally(resolve)
        })
      },
      async checkForUpdates() {
        try {
          this.currentVersion = await window.electronApi.invoke('updater.getVersion')

          this.motd = sanitizeHtml((await this.$axios.$get(`${process.env.UPDATE_PROXY_URL}/motd/wotw`, {
            params: {
              version: this.currentVersion,
            },
          })).motd, {
            allowedClasses: {
              '*': ['mb-*'],
            },
          })

          this.availableReleases = (await this.$axios.$get(`${process.env.UPDATE_PROXY_URL}/releases`))
            .filter(release => !release.draft && !release.prerelease)
            .sort((a, b) => semver.compareLoose(b.name, a.name))
            .map(release => {
              const parser = new commonmark.Parser()
              const writer = new commonmark.HtmlRenderer()

              return {
                ...release,
                bodyHtml: sanitizeHtml(writer.render(parser.parse(release.body))),
              }
            })

          if (this.availableReleases.length > 0) {
            this.latestRelease = this.availableReleases[0]
          }
        } catch (e) {
          this.offlineMode = true
          console.error(e)
        }
      },
      async downloadAndInstallUpdate() {
        this.showUpdateAvailableDialog = false
        this.updateDownloadProgress = 0
        this.updateDownloading = true
        window.electronApi.on('updater.downloadProgress', (event, progress) => {
          this.updateDownloadProgress = progress.percent * 100
        })
        await window.electronApi.invoke('updater.downloadAndInstallUpdate', {
          url: this.latestRelease.assets.find(a => a.name === 'WotwRandoSetup.exe').browser_download_url,
        })
      },
      async launch(seedFile = null, forceLaunch = false) {
        if (this.launching) {
          return
        }

        this.showUpdateAvailableDialog = false
        this.launching = true

        if (seedFile !== null) {
          await window.electronApi.invoke('launcher.setCurrentSeedPath', seedFile)
        }

        if (!forceLaunch) {
          await this.checkForUpdatesOnce()
        }

        if (forceLaunch || this.updateAvailable) {
          this.showUpdateAvailableDialog = true
        } else {
          await window.electronApi.invoke('launcher.launch', seedFile)
        }

        this.launching = false
      },
      openWiki() {
        window.electronApi.invoke('launcher.openWiki')
      },
      openRandomizerDirectory() {
        window.electronApi.invoke('launcher.openRandomizerDirectory')
      },
      openGitHub() {
        window.electronApi.invoke('launcher.openGitHub')
      },
      openDiscord() {
        window.electronApi.invoke('launcher.openDiscord')
      },
      isNewVersion(version) {
        if (this.currentVersion === '' || this.currentVersion === 'develop') {
          return false
        }

        try {
          return semver.gt(version, this.currentVersion, true)
        } catch (e) {
          console.error(e)
          return false
        }
      },
      showCrashZipInExplorer() {
        window.electronApi.invoke('crash.showCrashZipInExplorer', this.currentCrashZipName)
      },
    },
  }
</script>

<style lang='scss' scoped>
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
      opacity: 50%;
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
    color: rgba(255, 255, 255, 0.5)
  }

  .text-lurk {
    opacity: 0.2;
  }

  .crash-ori {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 96px;
    transform: scaleX(-1);
  }

  .sticky {
    position: sticky;
    top: 1em;
  }
</style>

<style lang='scss'>
  .release-changelog {
    h1,
    h2,
    h3,
    h4,
    h5 {
      margin-bottom: 0.4em;
    }
  }
</style>
