<template>
  <v-container>
    <div class='text-center'>
      <h1 class='mt-12 mb-6'>Developer Tools</h1>

      <div class="gapped">
        <v-btn color="accent" to="/dev/population-cache">
          Population Cache
        </v-btn>
        <v-btn color="accent" to="/dev/handler-state">
          Handler State
        </v-btn>
        <v-btn color="accent" to="/dev/token">
          JWT
        </v-btn>
        <v-btn color="accent" to="/dev/impersonate">
          Impersonation
        </v-btn>
        <v-btn color="accent" to="/dev/bingo-tools">
          Bingo Tools
        </v-btn>
        <v-btn color="accent" to="/dev/league-season">
          League Season
        </v-btn>
      </div>
    </div>
  </v-container>
</template>

<script>
  export default {
  }
</script>

<style lang="scss" scoped>
  .gapped {
    gap: 0.5em;
  }
</style>
