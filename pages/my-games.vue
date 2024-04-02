<template>
  <v-container>
    <h1 class="text-center mt-6 mb-12">My Games</h1>

    <throttled-spinner>
      <template v-if="multiverses !== null">
        <div v-for="[date, multiversesOnDate] of multiversesByDate" :key="date">
          <h2 class="mt-10 mb-3">{{ date }}</h2>
          <div class="games-container">
            <wotw-multiverse-card
              v-for="multiverseMetadata in multiversesOnDate"
              :key="multiverseMetadata.id"
              :multiverse-metadata="multiverseMetadata"
            />
          </div>
        </div>
        <div v-if="multiversesByDate.length === 0" class="text-center">
          You didn't play any games yet
        </div>
      </template>
    </throttled-spinner>
  </v-container>
</template>

<script>
  import { formatsDates } from '~/assets/lib/formatsDates'
  import { hasOwnProperty } from '~/assets/lib/hasOwnProperty'

  export default {
    mixins: [formatsDates],
    data: () => ({
      multiverses: null,
    }),
    computed: {
      multiversesByDate() {
        const multiversesByDate = {}

        for (const multiverse of this.multiverses) {
          const dateString = this.formatDateRelative(multiverse.createdAt)

          if (!hasOwnProperty(multiversesByDate, dateString)) {
            multiversesByDate[dateString] = []
          }

          multiversesByDate[dateString].push(multiverse)
        }

        return Object.entries(multiversesByDate).sort((a, b) => b[1][0].createdAt - a[1][0].createdAt)
      },
    },
    mounted() {
      this.fetchMultiverses()
    },
    methods: {
      async fetchMultiverses() {
        this.multiverses = await this.$axios.$get('/multiverses/own')
      },
    },
  }
</script>

<style lang="scss" scoped>
  .games-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    grid-auto-rows: 1fr;
    gap: 1em;
  }
</style>
