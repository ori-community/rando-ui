import controllerButtons from '~/assets/electron/controllerButtons.yaml'

export class GamepadService {
  static getPressedButtons(gamepad) {
    const pressedButtons = []
    for (const button of Object.values(controllerButtons)) {
      if (button.jsId >= 0 && gamepad.buttons[button.jsId].pressed) {
        pressedButtons.push(button.unityId)
      }
    }

    // Handle virtual axis buttons
    if (gamepad.axes[0] < -0.5) pressedButtons.push('LeftStickLeft')
    if (gamepad.axes[0] > 0.5) pressedButtons.push('LeftStickRight')
    if (gamepad.axes[1] < -0.5) pressedButtons.push('LeftStickUp')
    if (gamepad.axes[1] > 0.5) pressedButtons.push('LeftStickDown')
    if (gamepad.axes[2] < -0.5) pressedButtons.push('RightStickLeft')
    if (gamepad.axes[2] > 0.5) pressedButtons.push('RightStickRight')
    if (gamepad.axes[3] < -0.5) pressedButtons.push('RightStickUp')
    if (gamepad.axes[3] > 0.5) pressedButtons.push('RightStickDown')

    return pressedButtons
  }
}
