import net from 'net'
import { LauncherService } from '~/electron/src/lib/LauncherService'

const PIPE_NAME = 'wotw_rando'
const PIPE_PATH = '\\\\.\\pipe\\'

let socket = null
let lastEventId = 0

const requestHandlers = {} // eventId -> resolve
const requestQueue = []
let requestsRunning = 0

export class RandoIPCService {
  static startConnectionCheckLoop() {
    console.log(`RandoIPC: Connection check loop started`)

    const checkRandoIpcAvailability = async () => {
      if (await LauncherService.isRandomizerRunning()) {
        await this.makeSureSocketIsConnected()
      }
    }

    setInterval(checkRandoIpcAvailability, 5000)
    checkRandoIpcAvailability()
  }

  /**
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
        // if (!fs.existsSync(PIPE_PATH + PIPE_NAME)) {
        //   reject(new Error('Rando IPC pipe does not exist'))
        //   return
        // }

        try {
          socket = new net.Socket()
          socket.on('error', error => {
            console.log('RandoIPC: Could not connect,', error)
            reject(error)
          })
          socket.on('close', () => {
            console.log('RandoIPC: Socket closed')
          })
          socket.connect(PIPE_PATH + PIPE_NAME, () => {
            console.log('RandoIPC: Connected')
            resolve()
          })
          socket.on('data', data => {
            const message = JSON.parse(data)
            if (message.event_id in requestHandlers) {
              console.log('RandoIPC: < ', message['payload'])
              requestHandlers[message.event_id].resolve(message['payload'])
            }
          })
        } catch (e) {
          console.log('RandoIPC: Error while connecting to pipe:', e)
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
        console.log('RandoIPC: > ', message)
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

  static async handleRequestQueue() {
    if (requestsRunning > 0) {
      return
    }

    const request = requestQueue.shift()
    if (request) {
      requestsRunning++
      await this.send(JSON.stringify({ event: request.event, event_id: request.event_id, payload: request.payload }))
      await requestHandlers[request.event_id].promise
      requestsRunning--

      await this.handleRequestQueue()
    }
  }

  static async request(event, payload = null) {
    await this.makeSureSocketIsConnected()

    const eventId = lastEventId++

    requestHandlers[eventId] = {}

    const promise = new Promise(resolve => {
      requestQueue.push({
        event,
        payload,
        event_id: eventId,
      })

      requestHandlers[eventId].resolve = resolve
    })
    requestHandlers[eventId].promise = promise

    this.handleRequestQueue().catch(console.log)

    return await promise
  }

  static async getUberStates(states) {
    return await this.request('get_uberstates', states)
  }

  static async getUberState(group, state) {
    return (await this.getUberStates([{ group, state }]))[0]
  }
}
