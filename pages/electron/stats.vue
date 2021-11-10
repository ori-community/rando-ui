<template>
  <v-container>
    <h1 class='text-center mt-12 mb-6'>Statistics</h1>

    <!-- TODO -->
    <wotw-stats-single-game-stat-view class='mx-auto' :stat='{}' />
  </v-container>
</template>

<script>
  export default {
    name: 'Stats',
  }
</script>

<style scoped>

</style>
