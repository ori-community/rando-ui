import fs from 'fs'
import { RANDOMIZER_BASE_PATH } from '../lib/Constants'

const CONTROLLER_BINDINGS_FILE = `${RANDOMIZER_BASE_PATH}/controller_bindings.json`
const KEYBOARD_BINDINGS_FILE = `${RANDOMIZER_BASE_PATH}/keyboard_bindings.json`

const getDefaultControllerBindings = () => ({
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
  OpenRandoWheel: [[ 2, 3 ]],
})

const getDefaultKeyboardBindings = () => ({
  OpenRandoWheel: [[ 118 ]],
  Binding1: [[ 306, 308, 49 ], [ 305, 307, 49 ], [ 313, 49 ]],
  Binding2: [[ 306, 308, 50 ], [ 305, 307, 50 ], [ 313, 50 ]],
  Binding3: [[ 306, 308, 51 ], [ 305, 307, 51 ], [ 313, 51 ]],
  Binding4: [[ 306, 308, 52 ], [ 305, 307, 52 ], [ 313, 52 ]],
  Binding5: [[ 306, 308, 53 ], [ 305, 307, 53 ], [ 313, 53 ]],
  Reload: [[ 308, 108 ], [ 307, 108 ]],
  ShowLastPickup: [[ 308, 116 ], [ 307, 116 ]],
  ShowProgressWithHints: [[ 308, 112 ], [ 307, 112 ]],
  WarpCredits: [[ 308, 99 ], [ 307, 99 ]],
  ToggleCursorLock: [[ 306, 308, 108 ], [ 305, 307, 108 ], [ 313, 108 ]],
  ShowDevFlag: [[ 308, 106 ], [ 307, 106 ]],
  ToggleDebug: [[ 306, 308, 100 ], [ 305, 307, 100 ], [ 313, 100 ]],
  PrintCoordinates: [[ 306, 308, 99 ], [ 305, 307, 99 ], [ 313, 99 ]],
  TeleportCheat: [[ 304, 308, 116 ], [ 303, 307, 116 ], [ 303, 313, 116 ]],
  UnlockSpoilers: [[ 306, 308, 117 ], [ 305, 307, 117 ], [ 313, 117 ]],
  TogglePickupNamesOnSpoiler: [[ 306, 308, 110 ], [ 305, 307, 110 ], [ 313, 110 ]],
  ForceExit: [[ 308, 47 ], [ 307, 47 ]],
})

export class BindingsService {
  static async makeSureControllerBindingsFileExists() {
    await this.saveControllerBindings(await this.loadControllerBindings())
  }

  static async loadControllerBindings() {
    if (!fs.existsSync(CONTROLLER_BINDINGS_FILE)) {
      return getDefaultControllerBindings()
    }

    return {
      ...getDefaultControllerBindings(),
      ...JSON.parse(await fs.promises.readFile(CONTROLLER_BINDINGS_FILE, { encoding: 'utf-8' })),
    }
  }

  static async saveControllerBindings(bindings) {
    await fs.promises.writeFile(CONTROLLER_BINDINGS_FILE, JSON.stringify(bindings, null, 2), { encoding: 'utf-8' })
  }


  static async makeSureKeyboardBindingsFileExists() {
    await this.saveKeyboardBindings(await this.loadKeyboardBindings())
  }

  static async loadKeyboardBindings() {
    if (!fs.existsSync(KEYBOARD_BINDINGS_FILE)) {
      return getDefaultKeyboardBindings()
    }

    return {
      ...getDefaultKeyboardBindings(),
      ...JSON.parse(await fs.promises.readFile(KEYBOARD_BINDINGS_FILE, { encoding: 'utf-8' })),
    }
  }

  static async saveKeyboardBindings(bindings) {
    await fs.promises.writeFile(KEYBOARD_BINDINGS_FILE, JSON.stringify(bindings, null, 2), { encoding: 'utf-8' })
  }
}
