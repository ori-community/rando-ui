<template>
  <v-container>
    <v-row>
      <v-col cols='12' md='9' order-md='0' order-sm='1'>
        <wotw-rando-settings />
      </v-col>
      <v-col cols='12' md='3' order-md='1' order-sm='0'>
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

        <v-btn x-large color='accent' block class='mt-6'>
          <img class='launch-icon' src='../../assets/images/launch.png' alt=''>
          Launch
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import { Octokit } from '@octokit/rest'

  export default {
    name: 'Index',
    data: () => ({
      currentVersion: '',
      latestRelease: null, // contains new version string if available
      updateDownloading: false,
      updateDownloadProgress: 0,
    }),
    head: () => ({
      title: 'Home',
      meta: [
        { hid: 'robots', name: 'robots', content: 'noindex' },
      ],
    }),
    computed: {
      updateAvailable() {
        return this.latestRelease !== null && this.currentVersion !== this.latestVersion
      },
      latestVersion() {
        return this.latestRelease?.name?.replaceAll(/[^[0-9.]/g, '')
      }
    },
    mounted() {
      this.checkForUpdates()
    },
    methods: {
      async checkForUpdates() {
        this.currentVersion = await window.electronApi.invoke('updater.getVersion')
        const octokit = new Octokit
        this.latestRelease = (await octokit.rest.repos.getLatestRelease({
          owner: 'sparkle-preference',
          repo: 'OriWotwRandomizerClient',
        })).data
      },
      async downloadAndInstallUpdate() {
        this.updateDownloadProgress = 0
        this.updateDownloading = true
        window.electronApi.on('updater.downloadProgress', (event, progress) => {
          this.updateDownloadProgress = progress.percent * 100
        })
        await window.electronApi.invoke('updater.downloadAndInstallUpdate', {
          url: this.latestRelease.assets.find(a => a.name === 'WotwRando.exe').browser_download_url,
        })
      }
    }
  }
</script>

<style lang='scss' scoped>
  .launch-icon {
    height: 2.25em;
    width: auto;
    margin-right: 0.25em;
    margin-left: -0.5em;
  }
</style>
