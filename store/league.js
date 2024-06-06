export const state = () => ({
  pendingGames: null,  // null | [{season, game}]
})

export const getters = {
  pendingGamesCount(state) {
    return state.pendingGames?.length ?? 0
  }
}

export const mutations = {
  setPendingGames(state, pendingGames) {
    state.pendingGames = pendingGames
  },
}

export const actions = {
  async updatePendingGames({ commit, rootGetters }) {
    if (!rootGetters['user/isLoggedIn']) {
      commit('setPendingGames', [])
      return
    }

    try {
      const pendingSeasons = await this.$axios.$get('/league/seasons/pending')

      commit(
        'setPendingGames',
        pendingSeasons.flatMap(season => {
          const currentGame = season.games.find(g => g.id === season.currentGameId)
          if (currentGame?.userMetadata?.ownSubmission === null) {
            return [{game: currentGame, season}]
          }

          return []
        })
      )
    } catch (e) {
      commit('setPendingGames', [])
      console.error(e)
    }
  },
}
