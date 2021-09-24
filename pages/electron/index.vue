<template>
  <v-container>
    <v-row>
      <v-col cols='12' md='9' order-md='0' order='1'>

      </v-col>
      <v-col cols='12' md='3' order-md='1' order='0'>
        <v-card :color='updateAvailable ? `warning darken-4` : `background lighten-1`' class='pa-4'>
          <h3>Version: {{ currentVersion }}</h3>
          <template v-if='updateAvailable'>
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

        <v-btn x-large color='accent' block class='mt-6' :loading='launching' @click='launch()'>
          <img class='launch-icon' src='../../assets/images/launch.png' alt=''>
          Launch
        </v-btn>

        <v-btn color='background lighten-1' block class='mt-3' @click='openWiki'>
          <v-icon left>mdi-book-outline</v-icon>
          Read the Wiki
        </v-btn>

        <div v-if='settingsLoaded && settings.Flags.Dev' class='py-4 text-center hoverable'>
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
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import { Octokit } from '@octokit/rest'
  import { mapState } from 'vuex'
  import { generateClientJwt } from '~/assets/electron/generateClientJwt'

  export default {
    name: 'Index',
    data: () => ({
      currentVersion: '',
      latestRelease: null, // contains new version string if available
      updateDownloading: false,
      updateDownloadProgress: 0,
      launching: false,
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
        return this.latestRelease !== null && this.currentVersion !== this.latestVersion
      },
      latestVersion() {
        return this.latestRelease?.name?.replaceAll(/[^[0-9.]/g, '')
      },
    },
    watch: {
      $route: {
        immediate: true,
        handler(route) {
          if (route.query.seedFile) {
            this.$router.replace({ query: {} })
            this.launch(route.query.seedFile)
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
    mounted() {
      this.checkForUpdates()
    },
    methods: {
      async checkForUpdates() {
        this.currentVersion = await window.electronApi.invoke('updater.getVersion')
        const octokit = new Octokit
        this.latestRelease = (await octokit.rest.repos.getLatestRelease({
          owner: 'ori-rando',
          repo: 'build',
        })).data
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
</style>
