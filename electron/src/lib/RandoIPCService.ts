import { Socket } from "net";
import throttle from 'lodash.throttle'
import { uiIpc } from '@/api'
import { UberId } from '~/assets/lib/types/UberStates'
import { LocalTrackerWebSocketService } from '@/lib/LocalTrackerWebSocketService'
import { BingoBoardOverlayService } from '@/lib/BingoBoardOverlayService'
import { TASService } from "@/lib/TASService";

const PIPE_NAME = 'wotw_rando'
const PIPE_PATH = '\\\\.\\pipe\\'

let socket: Socket | null = null
let lastRequestId = 0

interface Request {
  type: 'request'
  method: string
  id: number
  payload: any
}

interface Response {
  type: 'response'
  id: number
  payload: any
}

interface QueuedRequest {
  request: Request
  expectsResponse: boolean
}

const outgoingRequestHandlers: { [requestId: number]: { resolve?: (arg?: any) => any; promise?: Promise<any> } } = {}
const outgoingRequestQueue: QueuedRequest[] = []
let outgoingRequestsRunning = 0

const notifyUberStateChangedThrottled: (state: number, group: number, value: number) => void = throttle((state: number, group: number, value: number) => {
  uiIpc.queueSend('game.uberStateChanged', { state, group, value })
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
  static isConnected() {
    return socket !== null && socket.readyState === 'open'
  }

  static startConnectionCheckLoop() {
    console.log(`RandoIPC: Connection check loop started`)

    const checkRandoIpcAvailability = async () => {
      try {
        await this.makeSureSocketIsConnected()
      } catch (e) {
        // Ignore
      }
    }

    setInterval(checkRandoIpcAvailability, 5000)
    checkRandoIpcAvailability()
  }

  /**
   * @returns {Promise<void>}
   */
  static makeSureSocketIsConnected() {
    if (!this.isConnected()) {
      console.log(`RandoIPC: Destroying IPC socket, readyState = ${socket?.readyState}`)
      socket?.destroy()
      socket = null
    }

    if (socket === null || socket.destroyed) {
      return new Promise<void>((resolve, reject) => {
        try {
          socket = new Socket()
          socket.on('error', (error) => {
            console.log('RandoIPC: Could not connect,', error.message)
            uiIpc.queueSend('randoIpc.setConnected', false)
            reject(error)
          })
          socket.on('close', () => {
            uiIpc.queueSend('randoIpc.setConnected', false)
            console.log('RandoIPC: Socket closed')
          })
          socket.connect(PIPE_PATH + PIPE_NAME, async () => {
            console.log('RandoIPC: Connected')
            uiIpc.queueSend('randoIpc.setConnected', true)
            await LocalTrackerWebSocketService.forceRefreshAll()
            resolve()
          })
          socket.on('data', (data) => {
            const message = JSON.parse(data.toString())

            if (message.type === 'request') {
              this.handleIncomingRequest(message).catch((error) => console.log('RandoIPC: Could not handle incoming request', error))
            } else if (message.type === 'response') {
              if (message.id in outgoingRequestHandlers) {
                outgoingRequestHandlers[message.id].resolve?.(message.payload)
              }
            } else {
              console.log('RandoIPC: Could not handle message:', data)
            }
          })
        } catch (e) {
          uiIpc.queueSend('randoIpc.setConnected', false)
          console.log('RandoIPC: Error while connecting to pipe:', e)
          reject(e)
        }
      })
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
        const { group, state, value } = request.payload
        if (group === 34543 && state === 11226 && value) {
          uiIpc.queueSend('game.gameFinished')
        }

        LocalTrackerWebSocketService.reportUberState({ group, state, value })
        break
      }
      case 'notify_on_reload':
      case 'notify_on_load': {
        await LocalTrackerWebSocketService.forceRefreshAll()
        break
      }
      case 'notify_input': {
        const { type, pressed } = request.payload

        if (pressed) {
          switch (type) {
            case 'ToggleBingoBoardOverlay':
              await BingoBoardOverlayService.toggleVisibility()
              break
          }
        }

        break
      }
      case 'notify_tas_state_changed': {
        TASService.reportStateChanged(request.payload)
        break
      }
      case 'notify_tas_timeline_loaded': {
        TASService.reportTimelineLoaded()
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

      if (queuedRequest.expectsResponse) {
        let tries = 0
        do {
          try {
            await this.send(queuedRequest.request)
            await outgoingRequestHandlers[queuedRequest.request.id].promise
            break
          } catch (e) {
            console.error(e)
            tries++
            console.log(`Trying again... (try ${tries})`)
          }
        } while (tries < 3)
      } else {
        await this.send(queuedRequest.request)
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

    const promise = new Promise<any>((resolve, reject) => {
      outgoingRequestQueue.push({
        request,
        expectsResponse,
      })
      outgoingRequestHandlers[request.id].resolve = resolve

      setTimeout(() => {
        reject(new Error('RandoIPC timeout'))
        delete outgoingRequestHandlers[request.id]
      }, 5000)
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

  static async getSeedFlags(): Promise<string[]> {
    return await this.request('get_flags')
  }

  static async setUberState(group: number, state: number, value: number): Promise<void> {
    await this.emit('set_uberstate', { group, state, value })
  }
}
