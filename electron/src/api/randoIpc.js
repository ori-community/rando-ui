import { RandoIPCService } from '~/electron/src/lib/RandoIPCService'

export default {
  isConnected() {
    return RandoIPCService.isConnected()
  },
}
