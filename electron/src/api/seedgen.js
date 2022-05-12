import {SeedgenService} from '~/electron/src/lib/SeedgenService'

export default {
  async getAreasFileContents() {
    return await SeedgenService.getAreasFileContents()
  },
  async getLocDataFileContents() {
    return await SeedgenService.getLocDataFileContents()
  },
  startWatchingSourceFiles() {
    SeedgenService.startWatchingSourceFiles()
  },
  stopWatchingSourceFiles() {
    SeedgenService.stopWatchingSourceFiles()
  },
}
