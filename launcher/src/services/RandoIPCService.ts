import type {UberId} from "../../../shared/UberStates"
import * as zmq from "zeromq"
import {EventEmitter} from "events"
import {LocalTrackerWebSocketService} from "./LocalTrackerWebSocketService"

let socket: zmq.Dealer | null = null
let receiveLoopActive = false
let lastRequestId = 0
let peerConnected = false

interface Request {
  type: "request"
  method: string
  id: number
  payload: unknown
}

interface Response {
  type: "response"
  id: number
  payload: unknown
}

interface QueuedRequest {
  request: Request
  expectsResponse: boolean
}

type RandoIPCEvent = {
  /** Emitted when the randomizer client connected to or disconnected from RandoIPC. true = connected */
  connectionStateChanged: [boolean],
}

const outgoingRequestHandlers: {
  [requestId: number]: { resolve?: (arg?: unknown) => unknown; promise?: Promise<unknown> }
} = {}
const outgoingRequestQueue: QueuedRequest[] = []

const makeRequest = (method: string, payload: unknown): Request => ({
  type: "request",
  method,
  id: lastRequestId++,
  payload,
})

const makeResponse = (requestId: number, payload: unknown): Response => ({
  type: "response",
  id: requestId,
  payload,
})

export class RandoIPCService {
  static shouldSendAllUberStateUpdates = false

  public static readonly events: EventEmitter<RandoIPCEvent> = new EventEmitter()

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

      socket.events.on("accept", () => {
        peerConnected = true
        this.events.emit("connectionStateChanged", true)
      })

      socket.events.on("disconnect", () => {
        peerConnected = false
        this.events.emit("connectionStateChanged", false)
      })

      await socket.bind("tcp://127.0.0.1:31414")

      if (!receiveLoopActive) {
        receiveLoopActive = true
        this._receiveLoop()
      }

      console.log("RandoIPC: ZMQ Server started")
    } catch (e) {
      this.events.emit("connectionStateChanged", false)
      console.log("RandoIPC: Error while starting IPC server:", e)
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

        if (message.type === "request") {
          this.handleIncomingRequest(message).catch((error) => console.log("RandoIPC: Could not handle incoming request", error))
        } else if (message.type === "response") {
          if (message.id in outgoingRequestHandlers) {
            outgoingRequestHandlers[message.id].resolve?.(message.payload)
          }
        } else {
          console.log("RandoIPC: Could not handle message:", messageString)
        }

        this._receiveLoop()
      })
      .catch((e: Error) => {
        console.error(e)
        retryLater()
      })
  }

  static async send(message: object) {
    await socket?.send(JSON.stringify(message))
  }

  static async handleIncomingRequest(request: Request) {
    switch (request.method) {
      case "notify_timer_state_changed": {
        const { in_game_time: inGameTime, async_loading_time: asyncLoadingTime, timer_should_run: timerShouldRun } = request.payload as {
          in_game_time: number,
          async_loading_time: number,
          timer_should_run: boolean,
        }
        LocalTrackerWebSocketService.reportTimerState(inGameTime, asyncLoadingTime, timerShouldRun)
        break
      }
      case "notify_on_uber_state_changed": {
        const {group, state, value} = request.payload as {
          group: number,
          state: number,
          value: number,
          previous_value: number
        }

        if (group === 34543 && state === 11226 && value) {
          // TODO: uiIpc
          // uiIpc.queueSend("game.gameFinished")
        }

        if (RandoIPCService.shouldSendAllUberStateUpdates) {
          // TODO: uiIpc
          // uiIpc.queueSend("game.uberStateChanged", {group, state, value, previousValue: previous_value})
        }

        LocalTrackerWebSocketService.reportUberState({group, state, value})
        break
      }
      case "notify_on_reload":
      case "notify_on_load": {
        await LocalTrackerWebSocketService.forceRefreshAll()
        break
      }
      case "notify_input": {
        const {type, pressed} = request.payload as {type: string, pressed: boolean}

        if (pressed) {
          switch (type) {
            case "ToggleBingoBoardOverlay":
              // TODO: BingoBoardOverlayService
              // await BingoBoardOverlayService.toggleVisibility()
              break
          }
        }

        break
      }
      case "notify_async_loading_state_changed": {
        // TODO: TASService
        // TASService.reportAsyncLoadingStateChanged(request.payload)
        break
      }
      case "notify_tas_state_changed": {
        // TODO: TASService
        // TASService.reportStateChanged(request.payload)
        break
      }
      case "notify_tas_timeline_loaded": {
        // TODO: TASService
        // TASService.reportTimelineLoaded(request.payload?.tas_config ?? null)
        break
      }
      case "league.run_submitted": {
        // TODO: uiIpc
        // uiIpc.queueSend('league.runSubmitted')
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

  static async request(method: string, payload: unknown = null, expectsResponse = true) {
    const request = makeRequest(method, payload)

    outgoingRequestHandlers[request.id] = {}

    const promise = new Promise<unknown>((resolve, reject) => {
      outgoingRequestQueue.push({
        request,
        expectsResponse,
      })
      outgoingRequestHandlers[request.id].resolve = resolve

      setTimeout(() => {
        reject(new Error("RandoIPC timeout"))
        delete outgoingRequestHandlers[request.id]
      }, 5000)
    })
    outgoingRequestHandlers[request.id].promise = promise

    this.handleOutgoingRequestQueue().catch(console.log)

    return await promise
  }

  static async emit(method: string, payload: unknown = null) {
    return await this.request(method, payload, false)
  }

  static async getUberStates(states: UberId[]): Promise<number[]> {
    return await this.request("get_uberstates", states) as number[]
  }

  static async getUberState(group: number, state: number): Promise<number> {
    return (await this.getUberStates([{group, state}]))[0]
  }

  static async getSeedFlags(): Promise<string[]> {
    return await this.request("get_flags") as string[]
  }

  static async setUberState(group: number, state: number, value: number): Promise<void> {
    await this.emit("set_uberstate", {group, state, value})
  }
}
