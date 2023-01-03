import { Socket } from 'net'
import throttle from 'lodash.throttle'
import { uiIpc } from '@/api'
import { UberId } from '~/assets/lib/types/UberStates'
import { LocalTrackerWebSocketService } from '@/lib/LocalTrackerWebSocketService'
import { BingoBoardOverlayService } from '@/lib/BingoBoardOverlayService'
import { TASService } from '@/lib/TASService'
import { getOS, Platform } from '~/assets/lib/os'
import net, { Server } from 'net'
import fs from 'fs'
import { Buffer } from 'node:buffer'

let server: Server | null = null
let socket: Socket | null = null
let lastRequestId = 0

function getPipePath() {
  switch (getOS()) {
    case Platform.Windows:
      return '\\\\.\\pipe\\wotw_rando'
    case Platform.Linux:
      return '/tmp/wotw_rando_ipc'
  }

  throw new Error('Cannot generate pipe path on this OS')
}

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

  static startIPCServer() {
    try {
      server = net.createServer((newSocket) => {
        console.log('RandoIPC: Client connected')

        // We got a new socket, drop any previous one.
        socket?.destroy()
        socket = newSocket

        socket.on('error', (error) => {
          console.log('RandoIPC: Error on connected socket,', error.message)
          uiIpc.queueSend('randoIpc.setConnected', false)
          socket?.destroy()
          socket = null
        })

        socket.on('close', () => {
          uiIpc.queueSend('randoIpc.setConnected', false)
          console.log('RandoIPC: Socket closed')
          socket?.destroy()
          socket = null
        })

        const message_buffer = Buffer.alloc(8192)
        let message_buffer_cursor = 0
        let discard_current_message = false

        socket.on('data', (data: Buffer) => {
          for (const byte of data) {
            if (discard_current_message) {
              if (byte === 0) {
                message_buffer_cursor = 0;
                discard_current_message = false;
              }
              continue
            }

            if (message_buffer_cursor >= 8192) {
              console.log('RandoIPC: Message exceeded max size, discarding')
              discard_current_message = true
              continue;
            }

            if (byte === 0) {
              const messageString = message_buffer.slice(0, message_buffer_cursor).toString();

              message_buffer_cursor = 0
              const message = JSON.parse(messageString)

              if (message.type === 'request') {
                this.handleIncomingRequest(message).catch((error) => console.log('RandoIPC: Could not handle incoming request', error))
              } else if (message.type === 'response') {
                if (message.id in outgoingRequestHandlers) {
                  outgoingRequestHandlers[message.id].resolve?.(message.payload)
                }
              } else {
                console.log('RandoIPC: Could not handle message:', messageString)
              }
            } else {
              message_buffer[message_buffer_cursor] = byte
              message_buffer_cursor++
            }
          }
        })

        uiIpc.queueSend('randoIpc.setConnected', true)
      })

      const pipePath = getPipePath()

      if (fs.existsSync(pipePath)) {
        fs.unlinkSync(pipePath)
      }

      server
        .listen(pipePath)
        .on('listening', () => {
          console.log(`RandoIPC: Listening on ${pipePath}`)
        })
        .on('error', (error) => {
          console.log(`RandoIPC: Server error:`, error)
        })
    } catch (e) {
      uiIpc.queueSend('randoIpc.setConnected', false)
      console.log('RandoIPC: Error while starting IPC server:', e)
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
        socket?.write(message + '\0', 'utf-8', () => resolve())
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
      case 'notify_loading_state_changed': {
        TASService.reportLoadingStateChanged(request.payload)
        break
      }
      case 'notify_tas_state_changed': {
        TASService.reportStateChanged(request.payload)
        break
      }
      case 'notify_tas_timeline_loaded': {
        TASService.reportTimelineLoaded(request.payload?.tas_config ?? null)
        break
      }
    }
  }

  static async handleOutgoingRequestQueue() {
    const queuedRequest = outgoingRequestQueue.shift()
    if (queuedRequest) {
      let tries = 0
      do {
        try {
          if (queuedRequest.expectsResponse) {
            await this.send(queuedRequest.request)
            await outgoingRequestHandlers[queuedRequest.request.id].promise
          } else {
            await this.send(queuedRequest.request)
            outgoingRequestHandlers[queuedRequest.request.id].resolve?.()
          }

          break
        } catch (e) {
          console.error(e)
          tries++
          console.log(`Trying again... (try ${tries})`)
        }
      } while (tries < 3)

      if (outgoingRequestQueue.length > 0) {
        await this.handleOutgoingRequestQueue()
      }
    }
  }

  static async request(method: string, payload: any = null, expectsResponse: boolean = true) {
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
