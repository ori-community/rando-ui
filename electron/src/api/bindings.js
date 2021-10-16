import { BindingsService } from '~/electron/src/lib/BindingsService'

export default {
  async loadControllerBindings() {
    return await BindingsService.loadControllerBindings()
  },

  async saveControllerBindings(event, bindings) {
    await BindingsService.saveControllerBindings(bindings)
  },

  async resetControllerBindings() {
    return await BindingsService.resetControllerBindings()
  },

  async loadKeyboardBindings() {
    return await BindingsService.loadKeyboardBindings()
  },

  async saveKeyboardBindings(event, bindings) {
    await BindingsService.saveKeyboardBindings(bindings)
  },

  async resetKeyboardBindings() {
    await BindingsService.resetKeyboardBindings()
  },
}
