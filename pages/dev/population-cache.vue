<template>
  <v-container>
    <h2>Population Cache Viewer</h2>

    <v-row>
      <v-col cols="12">
        <v-text-field v-model="playerId" label="Player ID" />
      </v-col>
    </v-row>

    <v-btn color="accent" @click="fetch">
      Fetch
    </v-btn>

    <pre>{{ cacheContent }}</pre>
  </v-container>
</template>

<script>
  export default {
    data: vm => ({
      playerId: vm.$route.query.playerId ?? vm.$store.state.user.user?.id ?? '',
      cacheContent: null,
    }),
    methods: {
      async fetch() {
        try {
          this.cacheContent = await this.$axios.$get(`/dev/caches/population/${this.playerId}`)
        } catch (e) {
          this.cacheContent = e
          console.error(e)
        }
      }
    }
  }
</script>

<style scoped>

</style>
