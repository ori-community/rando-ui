import { SettingsService } from '~/electron/src/lib/SettingsService'
import { dialog } from 'electron'

const selectPath = async (defaultPath) => {
  const result = await dialog.showOpenDialog({
    defaultPath: defaultPath,
    properties: ['openFile'],
    filters: [
      { name: 'Executables', extensions: ['exe'] }
    ],
  })

  if (!result.canceled) {
    return result.filePaths[0]
  }

  return null
}

export default {
  async getSettings() {
    return await SettingsService.getCurrentSettings()
  },
  async setSetting(event, { key, value }) {
    await SettingsService.setSetting(key, value)
  },
  async selectSteamPath() {
    return await selectPath((await SettingsService.getCurrentSettings())['Paths.Steam'], [
        { name: 'Executables', extensions: ['exe'] },
      ])
  },
  async selectGameBinaryPath() {
    return await selectPath(
      (await SettingsService.getCurrentSettings())['Paths.GameBinary'])
  },
  
}
