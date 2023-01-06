<template>
  <v-app dark>
    <v-main class='main'>
      <Nuxt />
    </v-main>
  </v-app>
</template>

<script>
  import { isElectron } from '~/assets/lib/isElectron'

  export default {
    async mounted() {
      if (isElectron()) {
        window.electronApi.on('main.settingsChanged', (_event, settings) => {
          this.$store.commit('electron/setSettings', settings)
        })

        window.electronApi.on('randoIpc.setConnected', (_event, connected) => {
          this.$store.commit('electron/setRandoIpcConnected', connected)
        })

        this.$store.commit('electron/setSettings', await window.electronApi.invoke('settings.getSettings'))
        this.$store.commit('electron/setRandoIpcConnected', await window.electronApi.invoke('randoIpc.isConnected'))
      }

      await this.$store.dispatch('user/updateUser')
      await this.$store.dispatch('auth/restoreJwtWhenHostChanged')
    },
  }
</script>

<style lang='scss'>
  // Global styles

  ::-webkit-scrollbar {
    width: 12px;
  }

  ::-webkit-scrollbar-track {
    background-color: var(--v-background-base);
  }

  ::-webkit-scrollbar-thumb {
    background-color: var(--v-background-lighten1);
  }

  .inherit--text {
    color: inherit !important;
  }

  .list-move {
    transition: 400ms;
    z-index: 1;
  }
</style>
