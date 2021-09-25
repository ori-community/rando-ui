<template>
  <v-container>
    <h2 class='text-center mb-8'>Settings</h2>

    <v-card>
      <v-tabs>
        <v-tab>General</v-tab>
        <v-tab>Controller</v-tab>
        <v-tab>Keyboard</v-tab>

        <v-tab-item class='pa-5'>
          <wotw-rando-settings />
        </v-tab-item>
        <v-tab-item class='pa-5'>
          <wotw-rebind-settings type='controller' />
        </v-tab-item>
        <v-tab-item class='pa-5'>
          <wotw-rebind-settings type='kbm' />
        </v-tab-item>
      </v-tabs>
    </v-card>
  </v-container>
</template>

<script>
  export default {
    name: 'Settings',
    data: () => ({

    })
  }
</script>

<style scoped>

</style>
