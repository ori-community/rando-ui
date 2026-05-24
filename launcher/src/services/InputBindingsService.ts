import fs from "fs"
import {getRandomizerUserDataPath} from "@launcher/paths"
import {
  ComposableControllerInputBinding,
  ControllerBindings, ControllerInputBindings,
  ControllerRebindableAction,
  GameAction,
  GameActionMetadata,
  gameActionMetadata,
  KeyboardAndMouseBindings, KeyboardAndMouseInputBindings,
  KeyboardAndMouseRebindableAction,
  SingleControllerInputBinding,
} from "@shared/data/actions"
import {
  ControllerInput,
  controllerInputMetadata,
  controllerInputsByUnityId,
  keyboardAndMouseInputMetadata,
  keyboardAndMouseInputsByUnityId,
} from "@shared/data/input"
import {EventEmitter} from "events"
import {RandoIPCService} from "@launcher/services/RandoIPCService"

// The following ...File types are the structure saved to and loaded from the
// actual .json files.
type ControllerBindingsFile = Record<ControllerRebindableAction, number[][]>
type KeyboardAndMouseBindingsFile = Record<KeyboardAndMouseRebindableAction, {
  keys: number[],
  exact_modifier_keys: boolean
}[]>

function getDefaultControllerBindings(): ControllerBindings {
  const bindings: ControllerBindings = {} as ControllerBindings

  for (const [action, metadata] of Object.entries(gameActionMetadata) as [GameAction, GameActionMetadata][]) {
    if (metadata.controller === false) {
      continue
    }

    bindings[action as ControllerRebindableAction] = metadata.controller.default
  }

  return bindings
}

function getDefaultKeyboardAndMouseBindings(): KeyboardAndMouseBindings {
  const bindings: KeyboardAndMouseBindings = {} as KeyboardAndMouseBindings

  for (const [action, metadata] of Object.entries(gameActionMetadata) as [GameAction, GameActionMetadata][]) {
    if (metadata.keyboardAndMouse === false || metadata.keyboardAndMouse === "in-game") {
      continue
    }

    bindings[action as KeyboardAndMouseRebindableAction] = metadata.keyboardAndMouse.default
  }

  return bindings
}

type InputBindingsEvent = {
  /** Emitted when controller bindings changed */
  controllerBindingsChanged: [ControllerBindings],
  /** Emitted when keyboard and mouse bindings changed */
  keyboardAndMouseBindingsChanged: [KeyboardAndMouseBindings],
}

export class InputBindingsService {
  private static bindingsFlushTimeoutId: NodeJS.Timeout | null = null
  private static controllerBindingsCache: ControllerBindings | null = null
  private static keyboardAndMouseBindingsCache: KeyboardAndMouseBindings | null = null

  public static readonly events: EventEmitter<InputBindingsEvent> = new EventEmitter()

  private static getControllerBindingsPath() {
    return getRandomizerUserDataPath("controller_bindings.json")
  }

  private static getKeyboardBindingsPath() {
    return getRandomizerUserDataPath("keyboard_bindings.json")
  }

  static async makeSureControllerBindingsFileExists() {
    await this.storeControllerBindings(await this.loadControllerBindings())
  }

  private static async loadControllerBindings() {
    const controllerBindingsPath = this.getControllerBindingsPath()

    if (!fs.existsSync(controllerBindingsPath)) {
      return getDefaultControllerBindings()
    }

    const storedBindingsFile: Partial<ControllerBindingsFile> = JSON.parse(await fs.promises.readFile(controllerBindingsPath, {encoding: "utf-8"}))
    const storedBindings: Partial<ControllerBindings> = {}

    for (const [action, inputBindings] of Object.entries(storedBindingsFile)) {
      const controllerMetadata = gameActionMetadata[action as GameAction].controller
      if (controllerMetadata === false) {
        continue
      }

      switch (controllerMetadata.type) {
        case "single":
          storedBindings[action as ControllerRebindableAction] = inputBindings.map(unityIds => controllerInputsByUnityId.get(unityIds[0]))
          break;
        case "composable":
          storedBindings[action as ControllerRebindableAction] = inputBindings.map(compositions => compositions.map(unityId => controllerInputsByUnityId.get(unityId)))
          break;
      }
    }

    return {
      ...getDefaultControllerBindings(),
      ...storedBindings,
    }
  }

  private static async storeControllerBindings(bindings: ControllerBindings) {
    const file: ControllerBindingsFile = {} as ControllerBindingsFile
    for (const [action, inputBindings] of Object.entries(bindings)) {
      const controllerMetadata = gameActionMetadata[action as GameAction].controller
      if (controllerMetadata === false) {
        continue
      }

      file[action as ControllerRebindableAction] = (inputBindings.length > 0 && !Array.isArray(inputBindings[0]))
        ? [...(inputBindings as SingleControllerInputBinding[]).map((input: ControllerInput) => [controllerInputMetadata[input].unityId])]
        : (inputBindings as ComposableControllerInputBinding[]).map((inputs: ControllerInput[]) => inputs.map(input => controllerInputMetadata[input].unityId))
    }

    await fs.promises.writeFile(this.getControllerBindingsPath(), JSON.stringify(file, null, 2), {encoding: "utf-8"})
  }

  static async resetControllerBindings() {
    await this.storeControllerBindings(getDefaultControllerBindings())
  }

  static async makeSureKeyboardAndMouseBindingsFileExists() {
    await this.storeKeyboardAndMouseBindings(await this.loadKeyboardAndMouseBindings())
  }

  private static async loadKeyboardAndMouseBindings() {
    const keyboardBindingsPath = this.getKeyboardBindingsPath()

    if (!fs.existsSync(keyboardBindingsPath)) {
      return getDefaultKeyboardAndMouseBindings()
    }

    const storedBindingsFile: Partial<KeyboardAndMouseBindingsFile> = JSON.parse(await fs.promises.readFile(keyboardBindingsPath, {encoding: "utf-8"}))
    const storedBindings: Partial<KeyboardAndMouseBindings> = {}

    for (const [action, inputBindings] of Object.entries(storedBindingsFile)) {
      const keyboardMetadata = gameActionMetadata[action as GameAction].keyboardAndMouse
      if (keyboardMetadata === false || keyboardMetadata === "in-game") {
        continue
      }

      storedBindings[action as KeyboardAndMouseRebindableAction] = inputBindings.map((fileBindings) => ({
        inputs: fileBindings.keys.map(unityId => keyboardAndMouseInputsByUnityId.get(unityId)),
        exactModifiers: fileBindings.exact_modifier_keys,
      }))
    }

    return {
      ...getDefaultKeyboardAndMouseBindings(),
      ...storedBindings,
    }
  }

  private static async storeKeyboardAndMouseBindings(bindings: KeyboardAndMouseBindings) {
    const file: KeyboardAndMouseBindingsFile = {} as KeyboardAndMouseBindingsFile
    for (const [action, inputBindings] of Object.entries(bindings)) {
      const keyboardMetadata = gameActionMetadata[action as GameAction].keyboardAndMouse
      if (keyboardMetadata === false || keyboardMetadata === "in-game") {
        continue
      }

      file[action as KeyboardAndMouseRebindableAction] = inputBindings.map(binding => ({
        keys: binding.inputs.map(input => keyboardAndMouseInputMetadata[input].unityId),
        exact_modifier_keys: binding.exactModifiers,
      }))
    }

    await fs.promises.writeFile(this.getKeyboardBindingsPath(), JSON.stringify(file, null, 2), {encoding: "utf-8"})
  }

  static async resetKeyboardAndMouseBindings() {
    await this.storeKeyboardAndMouseBindings(getDefaultKeyboardAndMouseBindings())
  }

  static async getControllerBindings(): Promise<ControllerBindings> {
    if (this.controllerBindingsCache === null) {
      this.controllerBindingsCache = await this.loadControllerBindings()
    }

    return this.controllerBindingsCache
  }

  static async getKeyboardAndMouseBindings(): Promise<KeyboardAndMouseBindings> {
    if (this.keyboardAndMouseBindingsCache === null) {
      this.keyboardAndMouseBindingsCache = await this.loadKeyboardAndMouseBindings()
    }

    return this.keyboardAndMouseBindingsCache
  }

  static async setControllerActionBindings(action: ControllerRebindableAction, bindings: ControllerInputBindings) {
    await this.getControllerBindings()
    this.controllerBindingsCache[action] = bindings
    this.events.emit("controllerBindingsChanged", this.controllerBindingsCache)
    this.flushBindingsThrottled()
  }

  static async setKeyboardAndMouseActionBindings(action: KeyboardAndMouseRebindableAction, bindings: KeyboardAndMouseInputBindings) {
    await this.getKeyboardAndMouseBindings()
    this.keyboardAndMouseBindingsCache[action] = bindings
    this.events.emit("keyboardAndMouseBindingsChanged", this.keyboardAndMouseBindingsCache)
    this.flushBindingsThrottled()
  }

  private static flushBindingsThrottled() {
    if (this.bindingsFlushTimeoutId === null) {
      this.bindingsFlushTimeoutId = setTimeout(async () => {
        this.bindingsFlushTimeoutId = null

        await Promise.all([
          this.storeControllerBindings(this.controllerBindingsCache),
          this.storeKeyboardAndMouseBindings(this.keyboardAndMouseBindingsCache),
        ])

        if (RandoIPCService.isConnected()) {
          await RandoIPCService.emit("reload_controls")
        }
      }, 2000)
    }
  }
}
