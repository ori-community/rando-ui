import { ChatControlService } from '~/electron/src/lib/ChatControlService'

export default {
  async openWindow() {
    return await ChatControlService.openChatControl()
  },
  async runScript(event, { script, params = [] }) {
    await ChatControlService.runScript(script, params)
  },
  async connectTwitchAccount() {
    await ChatControlService.connectTwitchAccount()
  },
  async disconnectTwitchAccount() {
    await ChatControlService.disconnectTwitchAccount()
  },
  isConnected() {
    return ChatControlService.isConnected
  },
  async getRewards() {
    return await ChatControlService.getRewards()
  },
  async exportCommands(event, { json }) {
    await ChatControlService.exportCommands(json)
  },
  async importCommands() {
    return await ChatControlService.importCommands()
  },
}
