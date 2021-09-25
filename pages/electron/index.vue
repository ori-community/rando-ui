<template>
  <v-container>
    <v-row>
      <v-col cols='12' md='9' order-md='0' order='1'>
        <v-card class='mb-6 motd' color='background lighten-2'>
          <v-card-text class='motd-text'>
            <h2 class='mb-2'>Rando Weeklies</h2>
            <ul>
              <li>we currently do 2 community races saturdays and sundays (people are always welcome to setup races on their own!)</li>
              <li>current race times are Saturday at 12:00 pm pacific time and Sunday at 2 pm pacific time</li>
              <li>these races are open to everyone of any skill level! We use racetime.gg to time and record results; ask here for help getting that set up</li>
              <li>we play these races on the latest rando version</li>
            </ul>
          </v-card-text>
          <img class='motd-ori' src='~/assets/images/ori_lurk.png'>
        </v-card>

        <v-card v-for='release in availableReleases' :key='release.id' class='mb-2'>
          <v-card-title>Version {{ release.name }} <v-chip v-if='isNewVersion(release.name)' class='ml-2' small color='accent'>New</v-chip></v-card-title>
          <v-card-text class='text-pre-wrap'>{{ release.body }}</v-card-text>
        </v-card>
      </v-col>
      <v-col cols='12' md='3' order-md='1' order='0'>
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

        <v-btn x-large color='accent' block class='mt-6' :class='{"bottom-border-radius-0": currentSeedPath !== null}' :loading='launching' @click='launch()'>
          <img class='launch-icon' src='../../assets/images/launch.png' alt=''>
          Launch
        </v-btn>
        <v-card v-if='currentSeedPath !== null' outlined class='pa-2 text-center top-border-radius-0 current-seed-path'>
          {{ currentSeedPathBasename }}
        </v-card>

        <v-btn color='background lighten-1' block class='mt-3' @click='openWiki'>
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
      </v-col>
    </v-row>

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
          <li>We <b>imported your old settings</b> and <b>removed</b> the old randomizer. There may be some files left in your old randomizer folder, which you can delete if you want.</li>
          <li>The randomizer is now installed like any other application. Start it through the <b>Start Menu</b>, uninstall in in the Windows Settings app.</li>
          <li>Generate and play seeds <b>directly in the launcher</b>.</li>
          <li>You now need to <b>log in</b> to the launcher to play online games</li>
          <li>Online games have <b>Multiverses</b>. To play Co-Op, play in the same World. To play Multiworld, create multiple worlds in the same Universe.</li>
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
  import { Octokit } from '@octokit/rest'
  import { mapState } from 'vuex'
  import semver from 'semver'
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
      updateAvailable() {
        return this.latestRelease !== null && this.isNewVersion(this.latestVersion)
      },
      latestVersion() {
        return this.latestRelease?.name?.replaceAll(/[^[0-9.]/g, '')
      },
      currentSeedPathBasename() {
        if (!this.currentSeedPath) {
          return null
        }

        const parts = this.currentSeedPath.split(/[/\\]/)
        return parts[parts.length - 1]
      }
    },
    watch: {
      $route: {
        immediate: true,
        handler(route) {
          if (route.query.seedFile) {
            this.$router.replace({ query: {} })
            this.launch(route.query.seedFile)
            this.currentSeedPath = route.query.seedFile
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
      await this.checkForUpdates()
    },
    methods: {
      async checkForUpdates() {
        try {
          this.currentVersion = await window.electronApi.invoke('updater.getVersion')
          const octokit = new Octokit
          this.availableReleases = (await octokit.rest.repos.listReleases({
            owner: 'ori-rando',
            repo: 'build',
          })).data
            .filter(release => !release.draft && !release.prerelease)
            .sort((a, b) => semver.compareLoose(b.name, a.name))

          if (this.availableReleases.length > 0) {
            this.latestRelease = this.availableReleases[0]
          }
        } catch (e) {
          this.offlineMode = true
          console.error(e)
        }
      },
      async downloadAndInstallUpdate() {
        this.updateDownloadProgress = 0
        this.updateDownloading = true
        window.electronApi.on('updater.downloadProgress', (event, progress) => {
          this.updateDownloadProgress = progress.percent * 100
        })
        await window.electronApi.invoke('updater.downloadAndInstallUpdate', {
          url: this.latestRelease.assets.find(a => a.name === 'WotwRandoSetup.exe').browser_download_url,
        })
      },
      async launch(seedFile = null) {
        if (this.launching) {
          return
        }

        this.launching = true
        await window.electronApi.invoke('launcher.launch', seedFile)
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
  }
</style>
