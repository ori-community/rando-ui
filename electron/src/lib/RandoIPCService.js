import net from 'net'

const PIPE_NAME = 'wotw_rando'
const PIPE_PATH = '\\\\.\\pipe\\'

let socket = null

export class RandoIPCService {
  /**
   * @private
   * @returns {Promise<void>}
   */
  static makeSureSocketIsConnected() {
    if (socket !== null && socket.readyState !== 'open') {
      console.log(`Destroying IPC socket, readyState = ${socket.readyState}`)
      socket.destroy()
      socket = null
    }

    if (socket === null) {
      return new Promise(((resolve, reject) => {
        try {
          socket = net.createConnection(PIPE_PATH + PIPE_NAME, () => {
            console.log('RandoIPC: Connected')
            resolve()
          })
        } catch (e) {
          reject(e)
        }
      }))
    }
  }

  static async send(message) {
    await new Promise((resolve, reject) => {
      try {
        socket.write(message + '\r\n', 'utf-8', () => resolve())
      } catch (e) {
        reject(e)
      }
    })
  }

  static async trySend(message) {
    try {
      await this.makeSureSocketIsConnected()
      await this.send(message)
      return true
    } catch (e) {
      console.error('RandoIPC error:', e)
      return false
    }
  }
}
