import {saveAs} from 'file-saver'
import {EventBus} from '~/assets/lib/EventBus'
import {getDb} from '~/assets/db/database'
import {APIClient} from '~/assets/lib/api/APIClient'

const seedFromId = seedId => ({
  url: `${APIClient.axios.defaults.baseURL}/seeds/${seedId}/file`,
  fileName: `${seedId}.wotwr`,
})

export class SeedGeneratorResult {
  seedGroupId = null
  multiNames = []
  seedIds = []

  constructor(seedGroupId, multiNames, seedIds) {
    this.seedGroupId = seedGroupId
    this.multiNames = multiNames
    this.seedIds = seedIds
  }

  get hasMultipleSeeds() {
    return this.seedIds.length > 1
  }

  downloadSeed(index) {
    const seed = seedFromId(this.seedIds[index])
    saveAs(seed.url, seed.fileName)
  }

  // download all seeds to seeds directory
  async saveAllSeeds(showInExplorer = false) {
    const seeds = []
    for (const seedId of this.seedIds) {
      seeds.push(seedFromId(seedId))
    }

    await window.electronApi.invoke('launcher.downloadSeedsFromUrl', {
      seeds, showInExplorer
    })
  }

  // download seed to seeds directory
  async saveSeed(index, setToCurrent = true) {
    const seed = seedFromId(this.seedIds[index])
    await window.electronApi.invoke('launcher.downloadSeedFromUrl', {
      url: seed.url, fileName: seed.fileName, setToCurrent
    })
  }
}

export class SeedGeneratorAPI extends APIClient {
  async generateSeeds(seedgenConfig) {

    // Convert empty string seed to null
    if (!seedgenConfig.seed) {
      seedgenConfig.seed = null
    }

    const additionalParameters = {}
    // Fetch custom headers from IndexedDB
    additionalParameters.customHeaders = (await (await getDb).customHeaders.bulkGet(seedgenConfig.customHeaders))
      .map(h => h.content)


    // Remove multiNames if netcode is disabled
    if (!seedgenConfig.flags.includes('--multiplayer')) {
      seedgenConfig.multiNames = []
    }

    // Generate seeds
    const response = await APIClient.axios.$post('/seeds', {
      ...seedgenConfig,
      ...additionalParameters,
    })

    console.log(response)
    const result = new SeedGeneratorResult(
      response.result.seedGroupId,
      seedgenConfig.multiNames,
      response.result.seedIds
    )

    // // Generate multiverse
    // if (seedgenConfig.flags.includes('--multiplayer')) {
    //   this.multiverseId = await this.generateGame(this.seedGroupId, gameType, bingoSize)
    //   this.hasMultiverse = typeof this.multiverseId === 'number'
    // }

    if (response.warnings && response.warnings.includes('WARN')) {
      EventBus.$emit('notification', {
        message: response.warnings,
        color: 'warning',
      })
    }

    return result
  }
}
