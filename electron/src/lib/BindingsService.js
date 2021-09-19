import fs from 'fs'
import { RANDOMIZER_BASE_PATH } from '../lib/Constants'

const CONTROLLER_BINDINGS_FILE = `${RANDOMIZER_BASE_PATH}/controller_bindings.json`

const getDefaultBindings = () => ({
  MainMenuSaveCopy: [[ 10 ]],
  MainMenuSaveDelete: [[ 11 ]],
  Interact: [[ 10 ]],
  Jump: [[ 8 ]],
  Ability1: [[ 10 ]],
  Ability2: [[ 11 ]],
  Ability3: [[ 9 ]],
  Glide: [[ 3 ]],
  Grab: [[ 3 ]],
  Dash: [[ 1 ]],
  Burrow: [[ 1 ]],
  Bash: [[ 0 ]],
  Grapple: [[ 0 ]],
  DialogueAdvance: [[ 8 ], [ 9 ], [ 10 ], [ 11 ]],
  DialogueOption1: [[ 10 ]],
  DialogueOption2: [[ 11 ]],
  DialogueOption3: [[ 8 ]],
  DialogueExit: [[ 9 ]],
  OpenMapsShardsInventory: [[ 4 ]],
  OpenWeaponWheel: [[ 2 ]],
  PauseScreen: [[ 5 ]],
  LiveSignIn: [[ 11 ]],
  MapZoomIn: [[ 3 ]],
  MapZoomOut: [[ 2 ]],
  MenuSelect: [[ 8 ]],
  MenuBack: [[ 9 ]],
  MenuClose: [[ 9 ]],
  MenuDown: [[ 15 ], [ 19 ]],
  MenuUp: [[ 14 ], [ 18 ]],
  MenuLeft: [[ 12 ], [ 16 ]],
  MenuRight: [[ 13 ], [ 17 ]],
  MenuPageLeft: [[ 0 ]],
  MenuPageRight: [[ 1 ]],
  LeaderboardCycleFilter: [[ 0 ]],
  MapFilter: [[ 10 ]],
  MapDetails: [[ 11 ]],
  MapFocusOri: [[ 6 ]],
  MapFocusObjective: [[ 6 ]],
  OpenRandoWheel: [[ 2, 3 ]]
})

export class BindingsService {
  static async makeSureControllerBindingsFileExists() {
    await this.saveControllerBindings(await this.loadControllerBindings())
  }

  static async loadControllerBindings() {
    if (!fs.existsSync(CONTROLLER_BINDINGS_FILE)) {
      return getDefaultBindings()
    }

    return {
      ...getDefaultBindings(),
      ...JSON.parse(await fs.promises.readFile(CONTROLLER_BINDINGS_FILE, { encoding: 'utf-8' })),
    }
  }

  static async saveControllerBindings(bindings) {
    await fs.promises.writeFile(CONTROLLER_BINDINGS_FILE, JSON.stringify(bindings, null, 2), { encoding: 'utf-8' })
  }
}
