import { saveAs } from 'file-saver'
import { EventBus } from '~/assets/lib/EventBus'
import { getDb } from '~/assets/db/database'
import { isElectron } from '~/assets/lib/isElectron'

export class SeedGenerator{
  axios = null
  generationResult = null
  seedGroupId = null
  multiverseId = null
  hasMultiverse = false
  seedIds = null

  constructor(axios){
      this.axios = axios
  }

  async downloadAllSeeds(){
    
  }

  async downloadSeed(index, setToCurrent = true){
    const url = `${this.axios.defaults.baseURL}/seeds/${this.seedIds[index]}/file`
    const fileName = `seed_${this.seedIds[index]}.wotwr`

    if(isElectron()){
      try{
        await window.electronApi.invoke('launcher.downloadSeedFromUrl', {
          url, fileName, setToCurrent
        })
      } catch (e) {
        console.error(e)
      }
    } else {
      saveAs(url, fileName)
    }

  }

  async generateGame(seedGroupId, gameType, bingoSize) {
    switch (gameType) {
      case 'normal':
          return await this.axios.$post('/multiverses', {
            seedGroupId: seedGroupId,
        })
      case 'bingo':
        return await this.axios.$post('/multiverses', {
          bingo: { size: bingoSize },
          seedGroupId: seedGroupId,
        })
      case 'discovery_bingo':
        return await this.axios.$post('/multiverses', {
          bingo: { discovery: 2, size: bingoSize },
          seedGroupId: seedGroupId,
        })
      case 'lockout_bingo':
        return await this.axios.$post('/multiverses', {
          bingo: { lockout: true, size: bingoSize },
          seedGroupId: seedGroupId,
        })
    }
    return null
  }

  async generateSeeds(seedConfig, onlineGame, bingoSize) {

    // Convert empty string seed to null
    if (!seedConfig.seed) {
      seedConfig.seed = null
    }

    const additionalParameters = {}
    // Fetch custom headers from IndexedDB
    additionalParameters.customHeaders = (await (await getDb).customHeaders.bulkGet(seedConfig.customHeaders))
      .map(h => h.content)


    // Remove multiNames if netcode is disabled
    if (!seedConfig.flags.includes('--multiplayer')) {
      seedConfig.multiNames = []
    }

    // Generate seeds
    const response = await this.axios.$post('/seeds', {
      ...seedConfig,
      ...additionalParameters,
    })
    this.seedGroupId = response.result.seedGroupId
    this.seedIds = response.result.seedIds

    // Generate multiverse
    if (seedConfig.flags.includes('--multiplayer')) {
      this.multiverseId = await this.generateGame(this.seedGroupId, onlineGame, bingoSize)
      this.hasMultiverse = typeof this.multiverseId === 'number'
    }

    if (response.warnings && response.warnings.includes('WARN')) {
      EventBus.$emit('notification', {
        message: response.warnings,
        color: 'warning',
      })
    }
  }
}