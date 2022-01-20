<template>
  <div class='pa-3'>
    <WotwTrackerGoalModeView />
  </div>
</template>

<script>
  export default {
    name: 'Tracker',
    layout: 'plain',
    computed: {
      trackerSource() {
        return this.$route.query.source ?? 'http://127.0.0.1:31410'
      }
    },
  }
</script>

<style scoped>
  * {
    touch-action: none;
  }
</style>
