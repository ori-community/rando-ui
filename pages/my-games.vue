<template>
  <v-container>
    <h1 class="text-center mt-12 mb-6">My Games</h1>

    <throttled-spinner>
      <template v-if="multiverses !== null">
        <div v-for="[date, multiversesInPeriod] of multiversesByPeriod" :key="date">
          <h2 class="mt-10 mb-3">{{ date }}</h2>
          <div class="games-container">
            <wotw-multiverse-card
              v-for="multiverseMetadata in multiversesInPeriod"
              :key="multiverseMetadata.id"
              :multiverse-metadata="multiverseMetadata"
            />
          </div>
        </div>
        <div v-if="multiversesByPeriod.length === 0" class="text-center">
          <img class="ori-image" src="~/assets/images/ori_thumb.png" />
          <div>You didn't play any games yet</div>
        </div>
      </template>
    </throttled-spinner>
  </v-container>
</template>

<script>
  import { formatsDates } from '~/assets/lib/formatsDates'

  export default {
    mixins: [formatsDates],
    data: () => ({
      multiverses: null,
    }),
    head() {
      return {
        title: 'My Games',
      }
    },
    computed: {
      multiversesByPeriod() {

        const periodGroups = {}
        const today = new Date()
        const yesterday = new Date()
        yesterday.setDate(today.getDate() - 1)
        const thisWeekStart = new Date()
        thisWeekStart.setDate(today.getDate() - today.getDay())
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)

        // function to create period-group if missing
        const addToGroup = function (obj, period) {
          if (!periodGroups[period]) {
            periodGroups[period] = []
          }
          periodGroups[period].push(obj)
        }

        const sortedMultiverses = [...this.multiverses].sort((a, b) => b.createdAt - a.createdAt)
        
        sortedMultiverses.forEach((multiverse) => {
          const date = new Date(multiverse.createdAt)

          // assing multiverses by date to groups
          switch (true) {
            case date.toDateString() === today.toDateString():
              addToGroup(multiverse, 'Today')
              break
            case date.toDateString() === yesterday.toDateString():
              addToGroup(multiverse, 'Yesterday')
              break
            case date >= thisWeekStart:
              addToGroup(multiverse, 'This Week')
              break
            case date >= thisMonthStart && date < thisWeekStart:
              addToGroup(multiverse, 'Last Week')
              break
            case date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth():
              addToGroup(multiverse, 'This Month')
              break
            case date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() - 1:
              addToGroup(multiverse, 'Last Month')
              break
            default:
              addToGroup(multiverse, date.getFullYear)
              break
          }
        })
        console.log(periodGroups)
        return Object.entries(periodGroups)
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
  .ori-image {
    height: 3em;
  }
</style>
