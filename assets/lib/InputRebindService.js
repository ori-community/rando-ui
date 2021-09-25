import controllerButtons from '~/assets/electron/controllerButtons.yaml'
import keyboardButtons from '~/assets/electron/keyboardButtons.yaml'

export class InputRebindService {
  static getPressedGamepadButtonsUnityIds(gamepad) {
    const pressedButtons = []
    for (const button of Object.values(controllerButtons)) {
      if (button.jsId >= 0 && gamepad.buttons[button.jsId].pressed) {
        pressedButtons.push(button.unityId)
      }
    }

    // Handle virtual axis buttons
    if (gamepad.axes[0] < -0.5) pressedButtons.push(controllerButtons.LeftStickLeft.unityId)
    if (gamepad.axes[0] > 0.5) pressedButtons.push(controllerButtons.LeftStickRight.unityId)
    if (gamepad.axes[1] < -0.5) pressedButtons.push(controllerButtons.LeftStickUp.unityId)
    if (gamepad.axes[1] > 0.5) pressedButtons.push(controllerButtons.LeftStickDown.unityId)
    if (gamepad.axes[2] < -0.5) pressedButtons.push(controllerButtons.RightStickLeft.unityId)
    if (gamepad.axes[2] > 0.5) pressedButtons.push(controllerButtons.RightStickRight.unityId)
    if (gamepad.axes[3] < -0.5) pressedButtons.push(controllerButtons.RightStickUp.unityId)
    if (gamepad.axes[3] > 0.5) pressedButtons.push(controllerButtons.RightStickDown.unityId)

    return pressedButtons
  }

  static getKbmEventUnityId(event) {
    let jsId = null

    if (event instanceof KeyboardEvent) {
      jsId = event.code
    } else if (event instanceof MouseEvent) {
      jsId = `Mouse${event.button}`
    }

    if (jsId) {
      const button = Object.values(keyboardButtons).find(b => b.jsId === jsId)
      if (button) {
        return button.unityId
      }
    }

    return null
  }
}
