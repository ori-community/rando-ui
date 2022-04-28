import {APIClient} from '~/assets/lib/api/APIClient'

export const GAME_TYPE_NONE = 'none'
export const GAME_TYPE_NORMAL = 'normal'
export const GAME_TYPE_BINGO = 'bingo'
export const GAME_TYPE_DISCOVERY_BINGO = 'discovery_bingo'
export const GAME_TYPE_LOCKOUT_BINGO = 'lockout_bingo'
// export const GAME_TYPE_HIDE_AND_SEEK = 'normal'

export class MultiverseAPIClient extends APIClient {

  /**
   * @param seedGroupId
   * @param gameType
   * @param bingoSize
   * @returns {Promise<null|any>} ID of the created multiverse, or null if game type is not supported
   */
  static async createMultiverse(seedGroupId, gameType, bingoSize) {
    console.log(APIClient.axios)
    switch (gameType) {
      case GAME_TYPE_NORMAL:
        return await APIClient.axios.$post('/multiverses', {
          seedGroupId,
        })
      case GAME_TYPE_BINGO:
        return await APIClient.axios.$post('/multiverses', {
          bingo: {size: bingoSize},
          seedGroupId,
        })
      case GAME_TYPE_DISCOVERY_BINGO:
        return await APIClient.axios.$post('/multiverses', {
          bingo: {discovery: 2, size: bingoSize},
          seedGroupId,
        })
      case GAME_TYPE_LOCKOUT_BINGO:
        return await APIClient.axios.$post('/multiverses', {
          bingo: {lockout: true, size: bingoSize},
          seedGroupId,
        })
    }

    return null
  }
}
