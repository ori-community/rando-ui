export const state = () => ({
  /**
   * Offset to server time in milliseconds
   */
  offset: 0,
  lastTimeSyncTimestamp: 0,
})

export const getters = {}

export const mutations = {
  setOffset(state, offset) {
    state.offset = offset
    state.lastTimeSyncTimestamp = Date.now()
  },
}

/**
 * Requests server time and calculates the time offset to local time
 * @returns {Promise<number>}
 */
export async function getServerTimeOffset($axios) {
  const startTime = Date.now()
  const serverTime = Number(await $axios.$get('/server/time'))
  const endTime = Date.now()

  const probableResponseTime = endTime - (endTime - startTime) / 2
  return serverTime - probableResponseTime
}

export const actions = {
  async syncTime({ commit, state }) {
    if ((Date.now() - 600000) < state.lastTimeSyncTimestamp) {
      // Don't sync more often than every 10m
      return
    }

    const SAMPLE_COUNT = 3
    const samples = []

    console.log('Syncing server time...')
    for (let i = 0; i < SAMPLE_COUNT; i++) {
      samples.push(await getServerTimeOffset(this.$axios))
    }

    const average = samples.reduce((a, b) => a + b, 0) / samples.length
    console.log('Synced server time. Offset =', average)

    commit('setOffset', average)
  },
}
