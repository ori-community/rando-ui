import { shell } from 'electron'
import { CrashDetectService } from '~/electron/src/lib/CrashDetectService'

export default {
  showSupportBundleInExplorer(event, supportBundleName) {
    shell.showItemInFolder(CrashDetectService.getFullPathToSupportBundle(supportBundleName))
  },

  async createSupportBundle() {
    return await CrashDetectService.createSupportBundle()
  }
}
