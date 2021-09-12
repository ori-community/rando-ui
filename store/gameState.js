import Vue from 'vue'
import { RandoProto } from '~/assets/proto/RandoProto'
import { decodePacket } from '~/assets/proto/RandoProtoUtil'
import { hasOwnProperty } from '~/assets/lib/hasOwnProperty'
import { WebSocketFactory } from '~/assets/lib/WebSocketFactory'

/** @type Object<Number, WebSocket> */
const webSockets = {} // gameId → ws

export const state = () => ({
  games: {},
})

const ensureGameExists = (state, gameId) => {
  if (!hasOwnProperty(state.games, gameId)) {
    Vue.set(state.games, gameId, {
      teams: [],
      spectators: [],
      bingoBoard: null,
      bingoTeams: [],
    })
  }
}

export const getters = {}

export const mutations = {
  setBingoBoard(state, { gameId, board }) {
    ensureGameExists(state, gameId)
    state.games[gameId].bingoBoard = board
  },
  setTeams(state, { gameId, teams }) {
    ensureGameExists(state, gameId)
    state.games[gameId].teams = teams
  },
  setSpectators(state, { gameId, spectators }) {
    ensureGameExists(state, gameId)
    state.games[gameId].spectators = spectators
  },
  setBingoTeams(state, { gameId, bingoTeams }) {
    ensureGameExists(state, gameId)
    state.games[gameId].bingoTeams = bingoTeams
  },
}

export const actions = {
  async fetchGame({ commit, dispatch }, gameId) {
    const game = await this.$axios.$get(`/games/${gameId}`)
    commit('setTeams', { gameId, teams: game.teams })
    commit('setSpectators', { gameId, spectators: game.spectators })
    if (game.hasBingoBoard) {
      await dispatch('fetchBingoBoard', gameId)
    }
  },
  async fetchBingoBoard({ commit }, gameId) {
    let board = null
    let bingoTeams = []

    try {
      const response = await this.$axios.$get(`/bingo/${gameId}`)
      board = response.board
      bingoTeams = response.teams ?? []
    } catch (e) {
      if (e.response.status !== 404) {
        console.error(e)
      } else {
        console.log('No bingo board available for game', gameId)
      }
    }

    commit('setBingoBoard', { gameId, board })
    commit('setBingoTeams', { gameId, bingoTeams })
  },
  async connectGame({ commit, dispatch, getters }, { gameId, reconnect = false, retries = 0 }) {
    let ws = webSockets[gameId] ?? null

    if (retries >= 5) {
      throw new Error('Max number of retries exceeded')
    }

    if (reconnect || (ws?.readyState !== WebSocket.OPEN && ws?.readyState !== WebSocket.CONNECTING)) {
      ws?.close()
      webSockets[gameId] = await WebSocketFactory.create(`/observers/${gameId}`)
      ws = webSockets[gameId]

      retries = 0

      ws.addEventListener('close', () => {
        setTimeout(() => {
          dispatch('connectGame', { gameId, retries: retries + 1 })
            .catch(error => {
              throw error
            })
        }, 1000 * (retries + 1))
      })
      ws.addEventListener('message', async event => {
        const packet = await decodePacket(event.data)
        console.log(packet)
        if (packet instanceof RandoProto.SyncBoardMessage) {
          commit('setBingoBoard', { gameId, board: packet.board })
        } else if (packet instanceof RandoProto.GameInfo) {
          commit('setTeams', { gameId, teams: packet.teams })
          commit('setSpectators', { gameId, spectators: packet.spectators })
        } else if (packet instanceof RandoProto.SyncBingoTeamsMessage) {
          commit('setBingoTeams', { gameId, bingoTeams: packet.teams })
        }
      })
    }
  },
  async spectateGame({ commit, dispatch }, gameId) {
    await this.$axios.post(`/games/${gameId}/spectate`)
    await dispatch('fetchGame', gameId)
    await dispatch('connectGame', { gameId, reconnect: true })
  },
}
