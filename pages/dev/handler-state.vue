<template>
  <v-container>
    <h2>Game Handler State Viewer</h2>

    <v-row>
      <v-col cols="12">
        <v-text-field v-model="multiverseId" label="Multiverse ID" />
      </v-col>
    </v-row>

    <v-btn color="accent" @click="fetch">
      Fetch
    </v-btn>

    <pre>{{ stateContent }}</pre>
  </v-container>
</template>

<script>
  export default {
    data: vm => ({
      multiverseId: vm.$route.query.multiverseId ?? '',
      stateContent: null,
    }),
    methods: {
      async fetch() {
        try {
          this.stateContent = await this.$axios.$get(`/dev/handlers/${this.multiverseId}/state`)
        } catch (e) {
          this.stateContent = e
          console.error(e)
        }
      }
    }
  }
</script>

<style scoped>

</style>
