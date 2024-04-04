import fs from 'fs'
import { RANDOMIZER_BASE_PATH } from '~/electron/src/lib/Constants'

const CONTROLLER_BINDINGS_FILE = `${RANDOMIZER_BASE_PATH}/controller_bindings.json`
const KEYBOARD_BINDINGS_FILE = `${RANDOMIZER_BASE_PATH}/keyboard_bindings.json`

const getDefaultControllerBindings = () => ({
  MainMenuSaveCopy: [[10]],
  MainMenuSaveDelete: [[11]],
  Interact: [[10]],
  Jump: [[8]],
  Ability1: [[10]],
  Ability2: [[11]],
  Ability3: [[9]],
  Glide: [[3]],
  Grab: [[3]],
  Dash: [[1]],
  Burrow: [[1]],
  Bash: [[0]],
  Grapple: [[0]],
  DialogueAdvance: [[8], [9], [10], [11]],
  DialogueOption1: [[10]],
  DialogueOption2: [[11]],
  DialogueOption3: [[8]],
  DialogueExit: [[9]],
  OpenMapsShardsInventory: [[4]],
  OpenWeaponWheel: [[2]],
  PauseScreen: [[5]],
  LiveSignIn: [[11]],
  MapZoomIn: [[3]],
  MapZoomOut: [[2]],
  MenuSelect: [[8]],
  MenuBack: [[9]],
  MenuClose: [[9]],
  MenuDown: [[15], [19]],
  MenuUp: [[14], [18]],
  MenuLeft: [[12], [16]],
  MenuRight: [[13], [17]],
  MenuPageLeft: [[0]],
  MenuPageRight: [[1]],
  LeaderboardCycleFilter: [[0]],
  MapFilter: [[10]],
  MapDetails: [[11]],
  MapFocusOri: [[6]],
  MapFocusObjective: [[6]],
  OpenRandoWheel: [[2, 3]],
  QuickBuy: [[10]],
  ToggleBingoBoardOverlay: [[23]],
})

const getDefaultKeyboardBindings = () => ({
  OpenRandoWheel: [
    { keys: [118], respects_modifiers: false },
  ],
  Binding1: [
    { keys: [308, 49], respects_modifiers: true },
    { keys: [307, 49], respects_modifiers: true },
  ],
  Binding2: [
    { keys: [308, 50], respects_modifiers: true, },
    { keys: [307, 50], respects_modifiers: true },
  ],
  Binding3: [
    { keys: [308, 51], respects_modifiers: true },
    { keys: [307, 51], respects_modifiers: true },
  ],
  Binding4: [
    { keys: [308, 52], respects_modifiers: true },
    { keys: [307, 52], respects_modifiers: true },
  ],
  Binding5: [
    { keys: [308, 53], respects_modifiers: true },
    { keys: [307, 53], respects_modifiers: true },
  ],
  ServerReconnect: [
    { keys: [308, 114], respects_modifiers: true },
    { keys: [307, 114], respects_modifiers: true },
  ],
  ReloadSeed: [
    { keys: [308, 286], respects_modifiers: true },
    { keys: [307, 286], respects_modifiers: true },
  ],
  ShowFlags: [
    { keys: [308, 102], respects_modifiers: true },
    { keys: [307, 102], respects_modifiers: true },
  ],
  ShowLastPickup: [
    { keys: [308, 116], respects_modifiers: true },
    { keys: [307, 116], respects_modifiers: true },
  ],
  ShowProgressWithHints: [
    { keys: [308, 112], respects_modifiers: true },
    { keys: [307, 112], respects_modifiers: true },
  ],
  WarpCredits: [
    { keys: [308, 99], respects_modifiers: true },
    { keys: [307, 99], respects_modifiers: true },
  ],
  ToggleCursorLock: [
    { keys: [308, 111], respects_modifiers: true },
    { keys: [307, 111], respects_modifiers: true },
  ],
  ShowDevFlag: [
    { keys: [308, 106], respects_modifiers: true },
    { keys: [307, 106], respects_modifiers: true },
  ],
  ToggleDebug: [],
  PrintCoordinates: [],
  TeleportCheat: [],
  UnlockSpoilers: [],
  TogglePickupNamesOnSpoiler: [
    { keys: [308, 110], respects_modifiers: true },
    { keys: [307, 110], respects_modifiers: true },
  ],
  ForceExit: [
    { keys: [308, 47], respects_modifiers: true },
    { keys: [307, 47], respects_modifiers: true },
  ],
  QuickBuy: [
    { keys: [49] },
  ],
  ToggleBingoBoardOverlay: [
    { keys: [111] },
  ],
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

  static async resetControllerBindings() {
    await this.saveControllerBindings(getDefaultControllerBindings())
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

  static async resetKeyboardBindings() {
    await this.saveKeyboardBindings(getDefaultKeyboardBindings())
  }
}
