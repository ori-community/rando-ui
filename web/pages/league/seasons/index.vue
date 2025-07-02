<template>
  <v-container>
    <h1 class="text-center mt-12 mb-2">Randomizer League</h1>
    <div class="mb-6 text-center">
      Welcome to the Randomizer League.<br>
      Pick a season and start gaming!
    </div>
    <div class="text-center mb-12">
      <v-btn variant="text" size="large" outlined @click="showLeagueInfo = true">
        <v-icon left>mdi-information-outline</v-icon>
        FAQ / Help
      </v-btn>
    </div>

    <rando-throttled-spinner>
      <div v-if="pendingGames !== null">
        <div v-if="pendingGames.length > 0" class="pt-2">
          <h2 class="mb-2">Your Pending Games</h2>

          <div class="seasons-container">
            <wotw-league-game-card
              v-for="pendingGame in pendingGames"
              :key="pendingGame.game.id"
              :game="pendingGame.game"
              :season="pendingGame.season"
              :game-count="pendingGame.season.gameCount"
              :playable-until="pendingGame.season.nextContinuationAt"
              :member-count="pendingGame.season.memberships?.length"
            />
          </div>
        </div>
      </div>
    </rando-throttled-spinner>

    <rando-throttled-spinner>
      <div v-if="!seasonsLoading" class="pt-6">
        <div v-if="categorizedSeasons.active.length > 0 || categorizedSeasons.upcoming.length > 0">
          <h2 class="mb-2">
            <template v-if="categorizedSeasons.active.length > 0 && categorizedSeasons.upcoming.length > 0">Active &
              Upcoming Seasons
            </template>
            <template v-else-if="categorizedSeasons.active.length > 0">Active Seasons</template>
            <template v-else>Upcoming Seasons</template>
          </h2>

          <div class="seasons-container">
            <wotw-league-season-card
              v-for="season in categorizedSeasons.active"
              :key="season.id"
              :season="season"
              mode="active"
              :joined-tag="userIsMemberOfSeason(season)"
            />
            <wotw-league-season-card
              v-for="season in categorizedSeasons.upcoming"
              :key="season.id"
              :season="season"
              mode="upcoming"
              upcoming-tag
              :joined-tag="userIsMemberOfSeason(season)"
            />
          </div>
        </div>

        <div v-if="categorizedSeasons.past.length > 0" class="past-seasons">
          <h2 class="mt-5 mb-2">Past Seasons</h2>
          <div class="seasons-container">
            <wotw-league-season-card
              v-for="season in categorizedSeasons.past"
              :key="season.id"
              :season="season"
              :joined-tag="userIsMemberOfSeason(season)"
            />
          </div>
        </div>
      </div>
    </rando-throttled-spinner>
  </v-container>
</template>

<script lang="ts" setup>
  import type {LeagueGameInfo, LeagueSeasonInfo} from "@shared/types/league"

  const {axios} = useAxios()
  const userStore = useUserStore()
  const seasonsLoading = ref(false)
  const leagueSeasons = ref<LeagueSeasonInfo[] | null>(null)
  const showLeagueInfo = ref(false)
  const leagueDiscordChannelUrl = ref('https://discord.gg/kXuZSAuxZt')

  const pendingGames: { game: LeagueGameInfo, season: LeagueSeasonInfo }[] = []   // TODO pending LeagueGames

  const categorizedSeasons = computed(() => {
    const value: {
      upcoming: LeagueSeasonInfo[],
      active: LeagueSeasonInfo[],
      past: LeagueSeasonInfo[],
    } = {upcoming: [], active: [], past: []}

    if (leagueSeasons.value) {
      for (const season of leagueSeasons.value) {
        if (season.canJoin && season.currentGameId === null) {
          value.upcoming.push(season)
        } else if (season.currentGameId !== null) {
          value.active.push(season)
        } else {
          value.past.unshift(season)
        }
      }
    }

    return value
  })

  onMounted(() => {
    loadSeasons()
  })

  const loadSeasons = (async () => {
    seasonsLoading.value = true
    try {
      leagueSeasons.value = (await axios.get('/league/seasons')).data
    } catch (e) {
      console.error(e)
    }

    seasonsLoading.value = false
  })

  const userIsMemberOfSeason = ((season: LeagueSeasonInfo) => {
    if (!userStore.isLoggedIn) return false
    return season.memberships?.some((m) => m.user.id === userStore.user?.id)
  })

</script>

<style lang="scss" scoped>
  .seasons-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    grid-auto-rows: 1fr;
    gap: 1em;
  }

  .past-seasons {
    opacity: 0.4;
    transition: opacity 300ms;

    &:hover {
      opacity: 1;
    }
  }
</style>
