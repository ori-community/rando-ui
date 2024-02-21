import Vue from 'vue'
import { hasOwnProperty } from '~/assets/lib/hasOwnProperty'
import { WebSocketFactory } from '~/assets/lib/WebSocketFactory'
import { decodePacket } from '~/assets/proto/ProtoUtil.ts'
import { EventBus } from '~/assets/lib/EventBus'

/** @type Object<Number, WebSocket> */
const webSockets = {} // multiverseId → ws

export const state = () => ({
  multiverses: {},
})

const ensureMultiverseExists = (state, multiverseId) => {
  if (!hasOwnProperty(state.multiverses, multiverseId)) {
    Vue.set(state.multiverses, multiverseId, {
      id: multiverseId,
      universes: [],
      spectators: [],
      bingoBoard: null,
      bingoUniverses: [],
      markedBingoGoals: [],
      gameHandlerType: null,
      gameHandlerClientInfo: null,
      seedSpoilerDownloadedBy: [],
      race: null,
      seedId: null,
      seed: null,
      locked: false,
    })
  }
}

export const getters = {}

export const mutations = {
  setBingoBoard(state, { multiverseId, board }) {
    ensureMultiverseExists(state, multiverseId)
    state.multiverses[multiverseId].bingoBoard = board
  },
  setMultiverseInfo(state, { multiverseId, multiverseInfo }) {
    ensureMultiverseExists(state, multiverseId)
    state.multiverses[multiverseId].universes = multiverseInfo.universes
    state.multiverses[multiverseId].spectators = multiverseInfo.spectators
    state.multiverses[multiverseId].seedId = multiverseInfo.seedId ?? null
    state.multiverses[multiverseId].gameHandlerType = multiverseInfo.gameHandlerType
    state.multiverses[multiverseId].locked = multiverseInfo.locked
    state.multiverses[multiverseId].isLockable = multiverseInfo.isLockable
    state.multiverses[multiverseId].race = multiverseInfo.race ?? null
    state.multiverses[multiverseId].seedSpoilerDownloadedBy = multiverseInfo.seedSpoilerDownloadedBy ?? []

    if (typeof multiverseInfo.gameHandlerClientInfo === 'string') {
      const decodedBinaryString = atob(multiverseInfo.gameHandlerClientInfo)
      const byteArray = new Array(decodedBinaryString.length)
      for (let i = 0; i < decodedBinaryString.length; i++) {
        byteArray[i] = decodedBinaryString.charCodeAt(i)
      }
      state.multiverses[multiverseId].gameHandlerClientInfo = Uint8Array.from(byteArray)
    } else {
      state.multiverses[multiverseId].gameHandlerClientInfo = multiverseInfo.gameHandlerClientInfo
    }
  },
  setBingoUniverses(state, { multiverseId, bingoUniverses }) {
    ensureMultiverseExists(state, multiverseId)
    state.multiverses[multiverseId].bingoUniverses = bingoUniverses
  },
  setMultiverseSeed(state, { multiverseId, seed }) {
    state.multiverses[multiverseId].seed = seed
  },
  toggleBingoGoalMarked(state, { multiverseId, x, y }) {
    if (state.multiverses[multiverseId].markedBingoGoals.some((m) => m.x === x && m.y === y)) {
      state.multiverses[multiverseId].markedBingoGoals = state.multiverses[multiverseId].markedBingoGoals.filter((m) => m.x !== x || m.y !== y)
      return
    }

    state.multiverses[multiverseId].markedBingoGoals.push({ x, y })
  },
  toggleMultipleBingoGoalMarked(state, { multiverseId, goals }) {
    const isSameGoal = (goal1, goal2) => goal1.x === goal2.x && goal1.y === goal2.y
    const multiverse = state.multiverses[multiverseId]

    // Whether all goals that are about to be marked are already marked
    const allGoalsAlreadyMarked = goals.every((goal) => multiverse.markedBingoGoals.some((markedGoals) => isSameGoal(goal, markedGoals)))

    console.log(allGoalsAlreadyMarked)
    if (allGoalsAlreadyMarked) {
      // Unmark all
      multiverse.markedBingoGoals = multiverse.markedBingoGoals.filter((markedGoal) => !goals.some((goal) => isSameGoal(goal, markedGoal)))
    } else {
      // Mark all
      multiverse.markedBingoGoals.push(...goals.filter((goal) => !multiverse.markedBingoGoals.some((markedGoal) => isSameGoal(goal, markedGoal))))
    }
  },
}

export const actions = {
  async fetchMultiverse({ commit, dispatch }, multiverseId) {
    const multiverse = await this.$axios.$get(`/multiverses/${multiverseId}`)
    commit('setMultiverseInfo', { multiverseId, multiverseInfo: multiverse })

    if (multiverse.seedId !== null) {
      await dispatch('fetchSeed', { multiverseId, seedId: multiverse.seedId })
    }

    if (multiverse.hasBingoBoard) {
      await dispatch('fetchBingoBoard', multiverseId)
    }
  },
  async fetchSeed({ commit }, { multiverseId, seedId }) {
    try {
      const seed = await this.$axios.$get(`/seeds/${seedId}`)
      commit('setMultiverseSeed', {
        multiverseId,
        seed,
      })
    } catch (e) {
      console.error(e)
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
  async connectMultiverse({ commit, dispatch, rootState }, { multiverseId, reconnect = false, retries = 0 }) {
    let ws = webSockets[multiverseId] ?? null

    if (retries >= 20) {
      throw new Error('Max number of retries exceeded')
    }

    const retryConnection = () =>
      setTimeout(() => {
        dispatch('connectMultiverse', { multiverseId, retries: retries + 1 }).catch((error) => {
          throw error
        })
      }, 1000 * (retries + 1))

    if (reconnect || (ws?.readyState !== WebSocket.OPEN && ws?.readyState !== WebSocket.CONNECTING)) {
      ws?.close()

      try {
        webSockets[multiverseId] = await WebSocketFactory.create(`/observers/${multiverseId}`, this.$paths)
        ws = webSockets[multiverseId]
      } catch (e) {
        retryConnection()
        return
      }

      retries = 0

      ws.addEventListener('close', () => {
        retryConnection()
      })
      ws.addEventListener('message', async (event) => {
        const packet = await decodePacket(event.data)

        if (!packet) {
          return
        }

        switch (packet.$type) {
          case 'RandoProto.SyncBoardMessage':
            console.log(packet.board)
            commit('setBingoBoard', { multiverseId, board: packet.board })
            break
          case 'RandoProto.MultiverseInfoMessage':
            commit('setMultiverseInfo', { multiverseId, multiverseInfo: packet })

            for (const universe of packet.universes) {
              for (const world of universe.worlds) {
                for (const member of world.members) {
                  if (member.id === rootState.user.user?.id) {
                    commit('user/setUser', member, { root: true })
                  }
                }
              }
            }
            break
          case 'RandoProto.SyncBingoUniversesMessage':
            commit('setBingoUniverses', { multiverseId, bingoUniverses: packet.bingoUniverses })
            break
          case 'RandoProto.ShowUINotificationMessage':
            EventBus.$emit('notification', {
              message: packet.text,
              color: packet.color,
            })
            break
        }
      })
    }
  },
  async spectateMultiverse({ dispatch }, multiverseId) {
    await this.$axios.post(`/multiverses/${multiverseId}/spectators`)
    await dispatch('fetchMultiverse', multiverseId)
    await dispatch('connectMultiverse', { multiverseId, reconnect: true })
  },
}
