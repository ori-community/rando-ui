import type {LeagueGameInfo, LeagueSeasonInfo} from "@shared/types/league"

export function useLeagueHelper() {
  const {axios, catchAxiosErrors} = useAxios()

  const pendingGames = ref<{ game: LeagueGameInfo, season: LeagueSeasonInfo }[] | null>(null)
  const pendingGamesCount = computed(() => pendingGames.value?.length ?? 0)

  async function updatePendingGames() {
    const userStore = useUserStore()

    if (!userStore.isLoggedIn) {
      pendingGames.value = []
      return
    }

    let pendingSeasons: LeagueSeasonInfo[] | [] = []
    await catchAxiosErrors(
      async () => {
        pendingSeasons = (await (axios.get("/league/seasons/pending"))).data as LeagueSeasonInfo[]
      },
      async (e) => {

        pendingGames.value = []
        console.error(e)
      },
    )

    try {
      pendingGames.value = pendingSeasons.flatMap(season => {
        const currentGame = season.games.find(g => g.id === season.currentGameId)
        if (currentGame?.userMetadata?.ownSubmission === null) {
          return [{game: currentGame, season}]
        }
        return []
      })
    } catch (e) {
      pendingGames.value = []
      console.error(e)
    }
  }

  return {
    pendingGames,
    pendingGamesCount,
    updatePendingGames,
  }

}
