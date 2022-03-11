import {BingoBoardOverlayService} from '~/electron/src/lib/BingoBoardOverlayService'

export default {
  async prepare(event, multiverseId) {
    await BingoBoardOverlayService.prepareBingoBoardOverlay(multiverseId)
  }
}
