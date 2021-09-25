<template>
  <v-card class='pa-2' elevation='0' color='background lighten-2'>
    {{ button }}
  </v-card>
</template>

<script>
  export default {
    name: 'WotwRebindSettingsButton',
    props: {
      button: {
        type: String,
        required: true,
      }
    }
  }
</script>

<style scoped>

</style>
