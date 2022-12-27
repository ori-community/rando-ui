<template>
  <v-container>
    <h1 class="text-center">Yoooo seed {{ seedId }}!</h1>

    <throttled-spinner>
      <div v-if="!!spoiler">
        <pre>{{ spoiler }}</pre>
      </div>
    </throttled-spinner>
  </v-container>
</template>

<script>
  export default {
    name: 'SeedSpoiler',
    data: () => ({
      spoiler: null,
    }),
    computed: {
      seedId() {
        return Number(this.$route.params.seedId)
      },
    },
    mounted() {
      this.fetchSpoiler()
    },
    methods: {
      async fetchSpoiler() {
        this.spoiler = await this.$axios.$get(`/seeds/${this.seedId}/spoiler`)
      }
    }
  }
</script>

<style scoped></style>
