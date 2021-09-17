import fs from 'fs'
import { RANDOMIZER_BASE_PATH } from '../lib/Constants'

const CONTROLLER_BINDINGS_FILE = `${RANDOMIZER_BASE_PATH}/controller_bindings.json`

export default {
  async loadControllerBindings() {
    const bindingFileContent = await fs.promises.readFile(CONTROLLER_BINDINGS_FILE, { encoding: 'utf-8'})
    return JSON.parse(bindingFileContent)
  },

  async saveControllerBindings(event, bindings) {
    await fs.promises.writeFile(CONTROLLER_BINDINGS_FILE, JSON.stringify(bindings, null, 2), { encoding: 'utf-8'})
  }
}
