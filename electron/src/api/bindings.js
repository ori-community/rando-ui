import { BindingsService } from '../lib/BindingsService'

export default {
  async loadControllerBindings() {
    return await BindingsService.loadControllerBindings()
  },

  async saveControllerBindings(event, bindings) {
    await BindingsService.saveControllerBindings(bindings)
  },
}
