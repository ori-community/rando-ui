import net from 'net'
import { LauncherService } from '~/electron/src/lib/LauncherService'

const PIPE_NAME = 'wotw_rando'
const PIPE_PATH = '\\\\.\\pipe\\'

let socket = null
let lastRequestId = 0

const outgoingRequestHandlers = {} // requestId -> resolve
const outgoingRequestQueue = []
let outgoingRequestsRunning = 0

const makeRequest = (method, payload) => ({
  type: 'request',
  method,
  id: lastRequestId++,
  payload,
})

const makeResponse = (requestId, payload) => ({
  type: 'response',
  id: requestId,
  payload,
})

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

            if (message.type === 'request') {
              this.handleIncomingRequest(message).catch(error => console.log('RandoIPC: Could not handle incoming request', error))
            } else if (message.type === 'response') {
              if (message.id in outgoingRequestHandlers) {
                outgoingRequestHandlers[message.event_id].resolve(message['payload'])
              }
            } else {
              console.log('RandoIPC: Could not handle message:', data)
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
    message = JSON.stringify(message)

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

  static async handleIncomingRequest(request) {
    switch (request.method) {
      case 'get_stats':
        // TODO: do stuff
        await this.send(makeResponse(request.id, {
          deaths: 69,
          ppm: 42,
        }))
    }
  }

  static async handleOutgoingRequestQueue() {
    if (outgoingRequestsRunning > 0) {
      return
    }

    const request = outgoingRequestQueue.shift()
    if (request) {
      outgoingRequestsRunning++
      await this.send(request)
      await outgoingRequestHandlers[request.request_id].promise
      outgoingRequestsRunning--

      await this.handleOutgoingRequestQueue()
    }
  }

  static async request(method, payload = null) {
    await this.makeSureSocketIsConnected()

    const request = makeRequest(method, payload)

    outgoingRequestHandlers[request.id] = {}

    const promise = new Promise(resolve => {
      outgoingRequestQueue.push(request)
      outgoingRequestHandlers[request.id].resolve = resolve
    })
    outgoingRequestHandlers[request.id].promise = promise

    this.handleOutgoingRequestQueue().catch(console.log)

    return await promise
  }

  static async getUberStates(states) {
    return await this.request('get_uberstates', states)
  }

  static async getUberState(group, state) {
    return (await this.getUberStates([{ group, state }]))[0]
  }
}
