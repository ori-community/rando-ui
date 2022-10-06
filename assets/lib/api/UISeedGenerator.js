import { saveAs } from 'file-saver'
import { AxiosAPI } from '~/assets/lib/api/AxiosAPI'
import { EventBus } from '~/assets/lib/EventBus'

export class SeedgenResponse {
  constructor(data, baseUrl) {
    this.data = data
    this._baseUrl = baseUrl

    this.electronApi = {
      downloadSeed: async (options = {}) => {
        this._ensureSingleWorld()

        await window.electronApi.invoke('launcher.downloadSeedFromUrl', {
          url: this.worldSeedUrls[0],
          fileName: this.worldSeedFileNames[0],
          ...options,
        })
      },
    }

    this.webApi = {
      downloadSeed: () => {
        this._ensureSingleWorld()
        saveAs(this.worldSeedUrls[0], this.worldSeedFileNames[0])
      },
    }
  }

  _ensureSingleWorld() {
    if (this.data.result.worldSeedIds.length !== 1) {
      throw new Error('This method can only be called with single world seeds')
    }
  }

  get worldSeedUrls() {
    return this.data.result.worldSeedIds.map((id) => `${this._baseUrl}/world-seeds/${id}/file`)
  }

  get worldSeedFileNames() {
    return this.data.result.worldSeedIds.map((id) => `${id}.wotwr`)
  }
}

export class UISeedGenerator extends AxiosAPI {
  async generateSeed(universePreset) {
    const data = await this.axios.$post('/seeds', universePreset)

    if (data.warnings && data.warnings.includes('WARN')) {
      EventBus.$emit('notification', {
        message: data.warnings,
        color: 'warning',
      })
    }

    return new SeedgenResponse(data, this.axios.defaults.baseURL)
  }
}
