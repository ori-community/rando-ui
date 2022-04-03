import { saveAs } from 'file-saver'
import { EventBus } from '~/assets/lib/EventBus'
import { getDb } from '~/assets/db/database'

export class SeedGenerator{
  axios = null
  seedGroupId = null
  multiverseId = null
  hasMultiverse = false
  multiNames = []
  seedIds = null

  constructor(axios){
      this.axios = axios
  }

  // download all seeds to seeds directory
  async downloadAllSeeds(_showInExplorer = false){
    try{
      const _seeds = []
      for (const file of this.files) {
        _seeds.push(this.newSeed(file))
      }
      await window.electronApi.invoke('launcher.downloadSeedsFromUrl', {
        seeds: _seeds, showInExplorer: _showInExplorer
      })
    } catch (e) {
      console.error(e)
      return false
    }
    return true
  }

  // download seed to seeds directory
  async downloadSeed(index, setToCurrent = true){
    const seed = this.newSeed(this.seedIds[index])
    try{
      await window.electronApi.invoke('launcher.downloadSeedFromUrl', {
        url: seed.url, fileName: seed.fileName, setToCurrent
      })
    } catch (e) {
      console.error(e)
      return false
    }
    return true
  }

  newSeed(seedId){
    return {
      url: `${this.axios.defaults.baseURL}/seeds/${seedId}/file`,
      fileName: `seed_${seedId}.wotwr`,
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
    this.multiNames = seedConfig.multiNames

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

  saveSeed(index){
    const seed = this.newSeed(this.files[index])
    saveAs(seed.url, seed.fileName)
  }
}