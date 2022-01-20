import { Socket } from 'net'
import { LauncherService } from '~/electron/src/lib/LauncherService'
import throttle from 'lodash.throttle'
import { uiIpc } from '@/api'
import { UberId } from '~/assets/lib/types/UberStates'

const PIPE_NAME = 'wotw_rando'
const PIPE_PATH = '\\\\.\\pipe\\'

interface NodeSocket extends Socket {
  readyState?: string,
}

let socket: NodeSocket|null = null
let lastRequestId = 0

interface Request {
  type: 'request',
  method: string,
  id: number,
  payload: any,
}

interface Response {
  type: 'response',
  id: number,
  payload: any,
}

interface QueuedRequest {
  request: Request,
  expectsResponse: boolean,
}

const outgoingRequestHandlers: {[requestId: number]: {resolve?: (arg?: any) => any, promise?: Promise<any>}} = {}
const outgoingRequestQueue: QueuedRequest[] = []
let outgoingRequestsRunning = 0

const notifyUberStateChangedThrottled: (state: number, group: number, value: number) => void = throttle((state: number, group: number, value: number) => {
  uiIpc.queueSend('game.uberStateChanged', {state, group, value})
}, 500)

const makeRequest = (method: string, payload: any): Request => ({
  type: 'request',
  method,
  id: lastRequestId++,
  payload,
})

const makeResponse = (requestId: number, payload: any): Response => ({
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
      return new Promise<void>(((resolve, reject) => {
        try {
          socket = new Socket()
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
            const message = JSON.parse(data.toString())

            if (message.type === 'request') {
              this.handleIncomingRequest(message).catch(error => console.log('RandoIPC: Could not handle incoming request', error))
            } else if (message.type === 'response') {
              if (message.id in outgoingRequestHandlers) {
                outgoingRequestHandlers[message.id].resolve?.(message.payload)
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

  static async send(message: any) {
    message = JSON.stringify(message)

    await new Promise<void>((resolve, reject) => {
      try {
        const errorCallback = (error: Error) => {
          throw error
        }
        socket?.once('error', errorCallback)
        console.log('RandoIPC: > ', message)
        socket?.write(message + '\r\n', 'utf-8', () => resolve())
        socket?.off('error', errorCallback)
      } catch (e) {
        reject(e)
      }
    })
  }

  static async handleIncomingRequest(request: Request) {
    switch (request.method) {
      case 'notify_on_uber_state_changed': {
        const {group, state, value} = request.payload
        if (group === 34543 && state === 11226 && value) {
          uiIpc.queueSend('game.gameFinished')
        }
        break
      }
    }
  }

  static async handleOutgoingRequestQueue() {
    if (outgoingRequestsRunning > 0) {
      return
    }

    const queuedRequest = outgoingRequestQueue.shift()
    if (queuedRequest) {
      outgoingRequestsRunning++
      await this.send(queuedRequest.request)

      if (queuedRequest.expectsResponse) {
        await outgoingRequestHandlers[queuedRequest.request.id].promise
      } else {
        outgoingRequestHandlers[queuedRequest.request.id].resolve?.()
      }

      outgoingRequestsRunning--

      await this.handleOutgoingRequestQueue()
    }
  }

  static async request(method: string, payload: any = null, expectsResponse: boolean = true) {
    await this.makeSureSocketIsConnected()

    const request = makeRequest(method, payload)

    outgoingRequestHandlers[request.id] = {}

    const promise = new Promise<any>(resolve => {
      outgoingRequestQueue.push({
        request,
        expectsResponse,
      })
      outgoingRequestHandlers[request.id].resolve = resolve
    })
    outgoingRequestHandlers[request.id].promise = promise

    this.handleOutgoingRequestQueue().catch(console.log)

    return await promise
  }

  static async emit(method: string, payload: any = null) {
    return await this.request(method, payload, false)
  }

  static async getUberStates(states: UberId[]): Promise<number[]> {
    return await this.request('get_uberstates', states)
  }

  static async getUberState(group: number, state: number): Promise<number> {
    return (await this.getUberStates([{ group, state }]))[0]
  }
}
