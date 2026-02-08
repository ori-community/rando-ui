<template>
  <v-container>
    <h1 class="text-center mt-12 mb-6">My Games</h1>

    <rando-throttled-spinner>
      <template v-if="multiverses !== null && !fetchingGames">
        <div class="games-container mt-8">
          <div class="timeline">
            <v-timeline truncate-line="start" side="end" density="comfortable">
              <template v-for="group of multiversesByPeriod" :key="group.period">
                <v-timeline-item hide-dot>
                  <h2>{{ group.period }}</h2>
                </v-timeline-item>
                <v-timeline-item
                  v-for="multiverseMetadata in group.multiverses"
                  :key="multiverseMetadata.id"
                  class="game-container"
                  :dot-color="Number(route.query.game) === multiverseMetadata.id ? 'primary' : 'secondary'"
                  @click="router.push({query: {...route.query, game: multiverseMetadata.id}})"
                  @dblclick="router.push({name: 'game-multiverseId', params: {multiverseId: multiverseMetadata.id}})"
                >
                  <template #opposite>
                    <div class="multiverse-id-container">
                      <div>
                        <span class="hashtag">#</span><span class="multiverse-id">{{ multiverseMetadata.id }}</span>
                      </div>
                    </div>
                  </template>
                  <template #icon>
                    <v-icon>{{ multiverseMetadata.hasBingoBoard ? "mdi-grid" : "" }}</v-icon>
                    <v-tooltip location="bottom" activator="parent" open-delay="500">
                      <span>Double click to open Multiverse</span>
                    </v-tooltip>
                  </template>
                  <div class="avatars ml-5">
                    <div v-for="user in multiverseMetadata.members" :key="user.id" class="avatar">
                      <rando-discord-avatar :user="user" />
                      <v-tooltip location="bottom" activator="parent" open-delay="250">
                        <span>{{ user.name }}</span>
                      </v-tooltip>
                    </div>
                  </div>

                </v-timeline-item>
              </template>
            </v-timeline>
          </div>

          <div v-if="route.query.game" class="multiverse-view-container mt-4">
            <wotw-multiverse-preview-pane :multiverse-id="Number(route.query.game)" />
          </div>
        </div>
        <div v-if="multiversesByPeriod.length === 0" class="text-center">
          <img class="ori-image" src="../../../shared/images/ori_thumb.png" alt="">
          <div>You haven't played any online games yet</div>
        </div>
      </template>
    </rando-throttled-spinner>
  </v-container>
</template>

<script lang="ts" setup>
  import type {MultiverseMetadataInfo} from "@shared/types/http-api"

  useHead({title: "My Games"})

  type PeriodGroup = {
    period: string,
    multiverses: MultiverseMetadataInfo[],
  }
  const {axios} = useAxios()
  const route = useRoute()
  const router = useRouter()

  const multiverses = ref<MultiverseMetadataInfo[]>([])
  const fetchingGames = ref(true)
  const multiversesByPeriod = computed(() => {
    const periodGroups: Array<PeriodGroup> = new Array<PeriodGroup>()

    // set dates that separate periods
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(today.getDate() - 1)
    const thisWeekStart = new Date()
    thisWeekStart.setDate(today.getDate() - today.getDay() + 1)
    thisWeekStart.setHours(0, 0, 0, 0)
    const lastWeekStart = new Date()
    lastWeekStart.setDate(today.getDate() - today.getDay() + 1 - 7)
    lastWeekStart.setHours(0, 0, 0, 0)
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)

    // function to add to group and create period-group if missing
    const addToGroup = function (obj: MultiverseMetadataInfo, period: string) {
      const index = periodGroups.findIndex(g => g.period === period)
      if (index < 0) {
        periodGroups.push({
          period,
          multiverses: [obj],
        })
      } else {
        periodGroups[index]?.multiverses.push(obj)
      }
    }

    const sortedMultiverses = [...multiverses.value].sort((a, b) => b.createdAt - a.createdAt)

    sortedMultiverses.forEach((multiverse) => {
      const multiverseDate = new Date(multiverse.createdAt)

      // assing multiverses by date to groups
      switch (true) {
        case multiverseDate.toDateString() === today.toDateString():
          addToGroup(multiverse, "Today")
          break
        case multiverseDate.toDateString() === yesterday.toDateString():
          addToGroup(multiverse, "Yesterday")
          break
        case multiverseDate >= thisWeekStart:
          addToGroup(multiverse, "This Week")
          break
        case multiverseDate >= lastWeekStart:
          addToGroup(multiverse, "Last Week")
          break
        case multiverseDate >= thisMonthStart:
          addToGroup(multiverse, "This Month")
          break
        case multiverseDate >= lastMonthStart:
          addToGroup(multiverse, "Last Month")
          break
        default:
          addToGroup(multiverse, multiverseDate.getFullYear().toString())
          break
      }
    })

    return periodGroups
  })
  const boardRef = ref<HTMLElement | null>(null)

  onMounted(() => {
    fetchMultiverses()
  })

  const fetchMultiverses = (async () => {
    fetchingGames.value = true
    multiverses.value = (await axios.get("/multiverses/own")).data
    fetchingGames.value = false
  })

  const centerBoard = (() => {
    boardRef.value?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  })
</script>

<style lang="scss" scoped>
  .games-container {
    display: flex;
    flex-direction: row;
    gap: 1em;
  }

  .timeline {
    min-width: 20em;
    height: fit-content;
  }

  .game-container {
    cursor: pointer;
  }

  .multiverse-id-container {
    display: flex;
    flex-direction: column;
    line-height: 1;

    .hashtag {
      font-size: 1em;
      opacity: 0.75;
    }

    .multiverse-id {
      font-size: 1.5em;
      font-weight: 900;
    }
  }

  .avatars {
    text-align: left;
    white-space: nowrap;

    .avatar {
      display: inline-block;
      margin-left: -16px;
      transition: margin 175ms;
    }

    &:hover {
      .avatar:nth-child(n+2) {
        margin-left: 0.2em;
      }
    }
  }

  .multiverse-view-container {
    width: 100%;
  }

  .board-container {
    min-height: 100vh;

    .board {
      flex-grow: 0;
      flex-shrink: 0;
      height: 100vh;
      width: 100vh;
      margin-left: auto;
      margin-right: auto;
    }
  }

  .ori-image {
    height: 3em;
  }

</style>
