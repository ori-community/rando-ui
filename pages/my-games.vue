<template>
  <v-container>
    <h1 class="text-center mt-12 mb-6">My Games</h1>

    <throttled-spinner>
      <template v-if="multiverses !== null">
        <div v-for="group of multiversesByPeriod" :key="group.period">
          <h2 class="mt-10 mb-3">{{ group.period }}</h2>
          <div class="games-container">
            <wotw-multiverse-card
              v-for="multiverseMetadata in group.multiverses"
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

        const periodGroups = []

        // set dates that separate periods
        const today = new Date()
        const yesterday = new Date()
        yesterday.setDate(today.getDate() - 1)
        const thisWeekStart = new Date()
        thisWeekStart.setDate(today.getDate() - today.getDay())
        const lastWeekStart = new Date()
        lastWeekStart.setDate(thisWeekStart.getDate() -7)
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() -1, 1)

        // function to add to group and create period-group if missing
        const addToGroup = function (obj, period) {
          const index = periodGroups.findIndex(g => g.period === period)
          if(index < 0){
            periodGroups.push({
              period,
              multiverses: [obj]
            })
          } else {
            periodGroups[index].multiverses.push(obj)
          }
        }

        const sortedMultiverses = [...this.multiverses].sort((a, b) => b.createdAt - a.createdAt)
        
        sortedMultiverses.forEach((multiverse) => {
          const multiverseDate = new Date(multiverse.createdAt)

          // assing multiverses by date to groups
          switch (true) {
            case multiverseDate.toDateString() === today.toDateString():
              addToGroup(multiverse, 'Today')
              break
            case multiverseDate.toDateString() === yesterday.toDateString():
              addToGroup(multiverse, 'Yesterday')
              break
            case multiverseDate >= thisWeekStart:
              addToGroup(multiverse, 'This Week')
              break
            case multiverseDate >= lastWeekStart:
              addToGroup(multiverse, 'Last Week')
              break
            case multiverseDate >= thisMonthStart:
              addToGroup(multiverse, 'This Month')
              break
            case multiverseDate >= lastMonthStart:
              addToGroup(multiverse, 'Last Month')
              break
            default:
              addToGroup(multiverse, multiverseDate.getFullYear())
              break
          }
        })

        return periodGroups
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
