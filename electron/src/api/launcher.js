import { LauncherService } from '../lib/LauncherService'
import { shell } from 'electron'

export default {
  async launch() {
    await LauncherService.launch()
  },

  openWiki() {
    shell.openExternal('https://wiki.orirando.com')
  },
}
