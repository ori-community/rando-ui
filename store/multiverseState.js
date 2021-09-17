import Vue from 'vue'
import { RandoProto } from '~/assets/proto/RandoProto'
import { decodePacket } from '~/assets/proto/RandoProtoUtil'
import { hasOwnProperty } from '~/assets/lib/hasOwnProperty'
import { WebSocketFactory } from '~/assets/lib/WebSocketFactory'

/** @type Object<Number, WebSocket> */
const webSockets = {} // multiverseId → ws

export const state = () => ({
  multiverses: {},
})

const ensureMultiverseExists = (state, multiverseId) => {
  if (!hasOwnProperty(state.multiverses, multiverseId)) {
    Vue.set(state.multiverses, multiverseId, {
      universes: [],
      spectators: [],
      bingoBoard: null,
      bingoUniverses: [],
    })
  }
}

export const getters = {}

export const mutations = {
  setBingoBoard(state, { multiverseId, board }) {
    ensureMultiverseExists(state, multiverseId)
    state.multiverses[multiverseId].bingoBoard = board
  },
  setUniverses(state, { multiverseId, universes }) {
    ensureMultiverseExists(state, multiverseId)
    state.multiverses[multiverseId].universes = universes
  },
  setSpectators(state, { multiverseId, spectators }) {
    ensureMultiverseExists(state, multiverseId)
    state.multiverses[multiverseId].spectators = spectators
  },
  setBingoUniverses(state, { multiverseId, bingoUniverses }) {
    ensureMultiverseExists(state, multiverseId)
    state.multiverses[multiverseId].bingoUniverses = bingoUniverses
  },
}

export const actions = {
  async fetchMultiverse({ commit, dispatch }, multiverseId) {
    const multiverse = await this.$axios.$get(`/multiverses/${multiverseId}`)
    commit('setUniverses', { multiverseId, universes: multiverse.universes })
    commit('setSpectators', { multiverseId, spectators: multiverse.spectators })
    if (multiverse.hasBingoBoard) {
      await dispatch('fetchBingoBoard', multiverseId)
    }
  },
  async fetchBingoBoard({ commit }, multiverseId) {
    let board = null
    let bingoUniverses = []

    try {
      const response = await this.$axios.$get(`/bingo/${multiverseId}`)
      board = response.board
      bingoUniverses = response.universes ?? []
    } catch (e) {
      if (e.response.status !== 404) {
        console.error(e)
      } else {
        console.log('No bingo board available for multiverse', multiverseId)
      }
    }

    commit('setBingoBoard', { multiverseId, board })
    commit('setBingoUniverses', { multiverseId, bingoUniverses })
  },
  async connectMultiverse({ commit, dispatch, getters }, { multiverseId, reconnect = false, retries = 0 }) {
    let ws = webSockets[multiverseId] ?? null

    if (retries >= 5) {
      throw new Error('Max number of retries exceeded')
    }

    if (reconnect || (ws?.readyState !== WebSocket.OPEN && ws?.readyState !== WebSocket.CONNECTING)) {
      ws?.close()
      webSockets[multiverseId] = await WebSocketFactory.create(`/observers/${multiverseId}`)
      ws = webSockets[multiverseId]

      retries = 0

      ws.addEventListener('close', () => {
        setTimeout(() => {
          dispatch('connectMultiverse', { multiverseId, retries: retries + 1 })
            .catch(error => {
              throw error
            })
        }, 1000 * (retries + 1))
      })
      ws.addEventListener('message', async event => {
        const packet = await decodePacket(event.data)

        if (!packet) {
          return
        }

        console.log(packet)
        if (packet instanceof RandoProto.SyncBoardMessage) {
          commit('setBingoBoard', { multiverseId, board: packet.board })
        } else if (packet instanceof RandoProto.MultiverseInfoMessage) {
          commit('setUniverses', { multiverseId, universes: packet.universes })
          commit('setSpectators', { multiverseId, spectators: packet.spectators })
        } else if (packet instanceof RandoProto.SyncBingoUniversesMessage) {
          commit('setBingoUniverses', { multiverseId, bingoUniverses: packet.bingoUniverses })
        }
      })
    }
  },
  async spectateMultiverse({ commit, dispatch }, multiverseId) {
    await this.$axios.post(`/multiverses/${multiverseId}/spectate`)
    await dispatch('fetchMultiverse', multiverseId)
    await dispatch('connectMultiverse', { multiverseId, reconnect: true })
  },
}
