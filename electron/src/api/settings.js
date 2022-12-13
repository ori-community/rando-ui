import { SettingsService } from '~/electron/src/lib/SettingsService'
import { dialog } from 'electron'

export default {
  async getSettings() {
    return await SettingsService.getCurrentSettings()
  },
  async setSetting(event, { key, value }) {
    await SettingsService.setSetting(key, value)
  },
  async selectSteamPath() {
    const result = await dialog.showOpenDialog({
      defaultPath: (await SettingsService.getCurrentSettings())['Paths.Steam'],
      properties: ['openFile'],
      filters: [
        { name: 'Executables', extensions: ['exe'] },
      ],
    })

    if (!result.canceled) {
      return result.filePaths[0]
    }

    return null
  },
  async selectGameBinaryPath() {
    const result = await dialog.showOpenDialog({
      defaultPath: (await SettingsService.getCurrentSettings())['Paths.GameBinary'],
      properties: ['openFile'],
    })

    if (!result.canceled) {
      return result.filePaths[0]
    }

    return null
  },
}
