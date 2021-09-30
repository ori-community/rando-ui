<template>
  <v-container>
    <h1 class='text-center mt-12 mb-6'>Settings</h1>

    <v-scroll-y-transition>
      <v-card v-show='settingsLoaded'>
        <v-tabs>
          <v-tab>General</v-tab>
          <v-tab>Controller</v-tab>
          <v-tab>Keyboard</v-tab>

          <v-tab-item class='pa-5'>
            <wotw-rando-settings @loaded='settingsLoaded = true' />
          </v-tab-item>
          <v-tab-item class='pa-5'>
            <wotw-rebind-settings type='controller' />
          </v-tab-item>
          <v-tab-item class='pa-5'>
            <wotw-rebind-settings type='kbm' />
          </v-tab-item>
        </v-tabs>
      </v-card>
    </v-scroll-y-transition>
  </v-container>
</template>

<script>
  export default {
    name: 'Settings',
    data: () => ({
      settingsLoaded: false,
    })
  }
</script>

<style scoped>

</style>
