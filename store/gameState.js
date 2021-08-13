import Vue from 'vue'
import { RandoProto } from '~/assets/proto/RandoProto'
import { decodePacket, makePacket } from '~/assets/proto/RandoProtoUtil'
import { hasOwnProperty } from '~/assets/lib/hasOwnProperty'

/** @type Object<Number, WebSocket> */
const webSockets = {} // gameId → ws

export const state = () => ({
  games: {},
})

const ensureGameExists = (state, gameId) => {
  if (!hasOwnProperty(state.games, gameId)) {
    Vue.set(state.games, gameId, {
      teams: [],
      bingoBoard: null,
    })
  }
}

export const getters = {}

export const mutations = {
  setBingoBoard(state, {gameId, board}) {
    ensureGameExists(state, gameId)
    state.games[gameId].bingoBoard = board
  },
  setTeams(state, {gameId, teams}) {
    ensureGameExists(state, gameId)
    state.games[gameId].teams = teams
  },
}

export const actions = {
  async fetchGame({ commit, dispatch }, gameId) {
    const game = await this.$axios.$get(`/games/${gameId}`)
    commit('setTeams', {gameId, teams: game.teams})
    if (game.hasBingoBoard) {
      await dispatch('fetchBingoBoard', gameId)
    }
  },
  async fetchBingoBoard({ commit }, gameId) {
    let board = null

    try {
      board = (await this.$axios.$get(`/bingo/${gameId}`)).board
    } catch (e) {
      if (e.response.status !== 404) {
        console.error(e)
      } else {
        console.log('No bingo board available for game', gameId)
      }
    }

    commit('setBingoBoard', {gameId, board})
  },
  connectGame({ commit }, { userId, gameId }) {
    let ws = webSockets[gameId] ?? null

    return new Promise(((resolve, reject) => {
      if (ws?.readyState !== WebSocket.OPEN && ws?.readyState !== WebSocket.CONNECTING) {
        ws?.close()
        webSockets[gameId] = new WebSocket(`${process.env.WS_BASE_URL}/observers/${gameId}`)
        ws = webSockets[gameId]
        ws.addEventListener('open', () => {
          ws.send(makePacket(RandoProto.RequestUpdatesMessage, {
            playerId: userId,
          }))

          resolve()
        })
        ws.addEventListener('close', reject)
        ws.addEventListener('message', async event => {
          const packet = await decodePacket(event.data)
          if (packet instanceof RandoProto.SyncBoardMessage) {
            commit('setBingoBoard', {gameId, board: packet.board})
          } else if (packet instanceof RandoProto.GameInfo) {
            commit('setTeams', {gameId, teams: packet.teams})
          }
        })
      } else {
        resolve()
      }
    }))
  },
}
