import { LauncherService } from '../lib/LauncherService'
import { shell } from 'electron'

export default {
  getOpenedSeedPath() {
    return LauncherService.getOpenedSeedPath()
  },

  async launch(seedPath = null) {
    await LauncherService.launch(seedPath)
  },

  openWiki() {
    shell.openExternal('https://wiki.orirando.com')
  },
}
