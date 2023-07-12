import throttle from 'lodash.throttle'
import { uiIpc } from '@/api'
import { UberId } from '~/assets/lib/types/UberStates'
import { LocalTrackerWebSocketService } from '@/lib/LocalTrackerWebSocketService'
import { BingoBoardOverlayService } from '@/lib/BingoBoardOverlayService'
import { TASService } from '@/lib/TASService'
import { Event } from '~/assets/lib/Event'
import * as zmq from 'zeromq'

let socket: zmq.Dealer | null = null
let receiveLoopActive = false
let lastRequestId = 0
let peerConnected = false

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

const events = {
  onConnect: new Event<void>(),
}

export class RandoIPCService {
  static get events() {
    return events
  }

  static isConnected() {
    return socket !== null && !socket.closed && peerConnected
  }

  static async startIPCServer() {
    try {
      if (socket !== null) {
        socket.close()
      }

      peerConnected = false
      socket = new zmq.Dealer({
        sendTimeout: 100,
      })

      socket.events.on('accept', () => {
        peerConnected = true
        uiIpc.queueSend('randoIpc.setConnected', true)
        this.events.onConnect.emit()
      })

      socket.events.on('disconnect', () => {
        peerConnected = false
        uiIpc.queueSend('randoIpc.setConnected', false)
      })

      await socket.bind('tcp://127.0.0.1:31414')

      if (!receiveLoopActive) {
        receiveLoopActive = true
        this._receiveLoop()
      }

      console.log('RandoIPC: ZMQ Server started')
    } catch (e) {
      uiIpc.queueSend('randoIpc.setConnected', false)
      console.log('RandoIPC: Error while starting IPC server:', e)
    }
  }

  static _receiveLoop() {
    const retryLater = () => {
      setTimeout(() => this._receiveLoop(), 1000)
    }

    if (socket === null) {
      retryLater()
      return
    }

    socket
      .receive()
      .then(([messageString]) => {
        const message = JSON.parse(messageString.toString())

        if (message.type === 'request') {
          this.handleIncomingRequest(message).catch((error) => console.log('RandoIPC: Could not handle incoming request', error))
        } else if (message.type === 'response') {
          if (message.id in outgoingRequestHandlers) {
            outgoingRequestHandlers[message.id].resolve?.(message.payload)
          }
        } else {
          console.log('RandoIPC: Could not handle message:', messageString)
        }

        this._receiveLoop()
      })
      .catch((e) => {
        console.error(e)
        retryLater()
      })
  }

  static async send(message: any) {
    message = JSON.stringify(message)
    await socket?.send(message)
  }

  static async handleIncomingRequest(request: Request) {
    switch (request.method) {
      case 'notify_timer_state_changed': {
        const { total_time: totalTime, loading_time: loadingTime, timer_should_run: timerShouldRun } = request.payload
        LocalTrackerWebSocketService.reportTimerState(totalTime, loadingTime, timerShouldRun)
        break
      }
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
