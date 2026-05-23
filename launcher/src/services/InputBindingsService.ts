import fs from "fs"
import {getRandomizerUserDataPath, getUserDataPath} from "@launcher/paths"
import {GameAction, GameActionMetadata, gameActionMetadata} from "@shared/data/actions"
import {controllerInputs, keyboardAndMouseInputs} from "@shared/data/input"

type ControllerRebindableAction = { [K in keyof typeof gameActionMetadata]: (typeof gameActionMetadata)[K]["controller"] extends false ? never : K }[keyof typeof gameActionMetadata]
type KeyboardAndMouseRebindableAction = { [K in keyof typeof gameActionMetadata]: (typeof gameActionMetadata)[K]["keyboardAndMouse"] extends (false | "in-game") ? never : K }[keyof typeof gameActionMetadata]

type ControllerBindings = Record<ControllerRebindableAction, number[][]>
type KeyboardAndMouseBindings = Record<KeyboardAndMouseRebindableAction, {
  keys: number[],
  exact_modifier_keys: boolean
}[]>

const getDefaultControllerBindings = (): ControllerBindings => {
  const bindings: ControllerBindings = {} as ControllerBindings

  for (const [action, metadata] of Object.entries(gameActionMetadata) as [GameAction, GameActionMetadata][]) {
    if (metadata.controller === false) {
      continue
    }

    switch (metadata.controller.type) {
      case "single":
        bindings[action as ControllerRebindableAction] = [metadata.controller.default.map(input => controllerInputs[input].unityId)]
        break
      case "composable":
        bindings[action as ControllerRebindableAction] = metadata.controller.default.map(inputs => inputs.map(input => controllerInputs[input].unityId))
        break
    }
  }

  return bindings
}

const getDefaultKeyboardAndMouseBindings = (): KeyboardAndMouseBindings => {
  const bindings: KeyboardAndMouseBindings = {} as KeyboardAndMouseBindings

  for (const [action, metadata] of Object.entries(gameActionMetadata) as [GameAction, GameActionMetadata][]) {
    if (metadata.keyboardAndMouse === false || metadata.keyboardAndMouse === "in-game") {
      continue
    }

    switch (metadata.keyboardAndMouse.type) {
      case "composable":
        bindings[action as KeyboardAndMouseRebindableAction] = metadata.keyboardAndMouse.default.map(inputs => ({
          keys: inputs.inputs.map(input => keyboardAndMouseInputs[input].unityId),
          exact_modifier_keys: inputs.exactModifiers,
        }))
        break
    }
  }

  return bindings
}

export class InputBindingsService {
  static getControllerBindingsPath() {
    return getRandomizerUserDataPath("controller_bindings.json")
  }

  static getKeyboardBindingsPath() {
    return getRandomizerUserDataPath("keyboard_bindings.json")
  }

  static async makeSureControllerBindingsFileExists() {
    await this.storeControllerBindings(await this.loadControllerBindings())
  }

  static async loadControllerBindings() {
    const controllerBindingsPath = InputBindingsService.getControllerBindingsPath()

    if (!fs.existsSync(controllerBindingsPath)) {
      return getDefaultControllerBindings()
    }

    return {
      ...getDefaultControllerBindings(),
      ...JSON.parse(await fs.promises.readFile(controllerBindingsPath, {encoding: "utf-8"})),
    }
  }

  static async storeControllerBindings(bindings: ControllerBindings) {
    await fs.promises.writeFile(InputBindingsService.getControllerBindingsPath(), JSON.stringify(bindings, null, 2), {encoding: "utf-8"})
  }

  static async resetControllerBindings() {
    await this.storeControllerBindings(getDefaultControllerBindings())
  }

  static async makeSureKeyboardBindingsFileExists() {
    await this.storeKeyboardBindings(await this.loadKeyboardBindings())
  }

  static async loadKeyboardBindings() {
    const keyboardBindingsPath = InputBindingsService.getKeyboardBindingsPath()

    if (!fs.existsSync(keyboardBindingsPath)) {
      return getDefaultKeyboardAndMouseBindings()
    }

    return {
      ...getDefaultKeyboardAndMouseBindings(),
      ...JSON.parse(await fs.promises.readFile(keyboardBindingsPath, {encoding: "utf-8"})),
    }
  }

  static async storeKeyboardBindings(bindings: KeyboardAndMouseBindings) {
    await fs.promises.writeFile(InputBindingsService.getKeyboardBindingsPath(), JSON.stringify(bindings, null, 2), {encoding: "utf-8"})
  }

  static async resetKeyboardBindings() {
    await this.storeKeyboardBindings(getDefaultKeyboardAndMouseBindings())
  }
}
