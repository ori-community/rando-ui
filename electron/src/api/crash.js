import { shell } from 'electron'
import { CrashDetectService } from '~/electron/src/lib/CrashDetectService'

export default {
  showCrashZipInExplorer(event, crashZipName) {
    shell.showItemInFolder(CrashDetectService.getFullPathToCrashZip(crashZipName))
  },
}
