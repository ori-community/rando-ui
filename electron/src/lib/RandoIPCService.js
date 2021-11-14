import net from 'net'
import { LauncherService } from '~/electron/src/lib/LauncherService'
import fs from 'fs'

const PIPE_NAME = 'wotw_rando'
const PIPE_PATH = '\\\\.\\pipe\\'

let socket = null
let lastEventId = 0

export class RandoIPCService {
  static startConnectionCheckLoop() {
    console.log(`RandoIPC: Connection check loop started`)

    setInterval(async () => {
      if (await LauncherService.isRandomizerRunning()) {
        await this.makeSureSocketIsConnected()
      }
    }, 5000)
  }

  /**
   * @private
   * @returns {Promise<void>}
   */
  static makeSureSocketIsConnected() {
    if (socket !== null && (socket.readyState !== 'open' || socket.destroyed)) {
      console.log(`RandoIPC: Destroying IPC socket, readyState = ${socket.readyState}`)
      socket.destroy()
      socket = null
    }

    if (socket === null) {
      return new Promise(((resolve, reject) => {
        if (!fs.existsSync(PIPE_PATH + PIPE_NAME)) {
          reject(new Error('Rando IPC pipe does not exist'))
          return
        }

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
        const errorCallback = error => {
          throw error
        }

        socket.once('error', errorCallback)
        socket.write(message + '\r\n', 'utf-8', () => resolve())
        socket.off('error', errorCallback)
      } catch (e) {
        reject(e)
      }
    })
  }

  static async trySend(event, payload = null) {
    try {
      await this.makeSureSocketIsConnected()
      await this.send(JSON.stringify({ event, payload }))
      return true
    } catch (e) {
      console.log('RandoIPC error:', e)
      return false
    }
  }

  static async request(event, payload = null) {
    await this.makeSureSocketIsConnected()

    const eventId = lastEventId++

    return (await Promise.all([
      new Promise(resolve => {
        const dataCallback = data => {
          const message = JSON.parse(data)
          if (message.event_id === eventId) {
            socket.off('data', dataCallback)
            resolve(JSON.parse(data))
          }
        }

        socket.on('data', dataCallback)
      }),
      this.send(JSON.stringify({ event, payload }))
    ]))[0]
  }
}
