import {AddressInfo, WebSocket, WebSocketServer} from "ws"
import type {UberId, UberState} from "@shared/types/UberStates"
import {RandoIPCService} from "@launcher/services/RandoIPCService"
import {Proto} from "@shared/proto"
import {decodePacket, makePacket} from "@shared/proto/ProtoUtil"
import {VersionService} from "@launcher/services/VersionService"
import {EventEmitter} from "events"
import log from "electron-log/main"
import {TRACKED_UBER_STATES, TrackedUberState} from "@shared/itemTracker/trackedUberStates"

type TrackedUberStatesLookupTable = {
  [uberHash: string]: TrackedUberState
}

type LocalTrackerWebSocketEvent = {
  /** Emitted when the local tracker WebSocket server is started or stopped. true = started */
  serverStateChanged: [boolean],
}

export class LocalTrackerWebSocketService {
  private static wss: WebSocketServer | null = null
  private static ws: WebSocket | null = null

  private static trackedUberStatesLookupTable: TrackedUberStatesLookupTable = {}

  private static _remoteTrackerEndpointId: string | null = null

  private static updateTimerStateIntervalId: NodeJS.Timeout | null = null

  public static readonly events: EventEmitter<LocalTrackerWebSocketEvent> = new EventEmitter()

  public static get remoteTrackerEndpointId(): string | null {
    return this._remoteTrackerEndpointId
  }

  private static uberIdHash(id: UberId) {
    return String(id.group) + "." + String(id.state)
  }

  private static webSocketListening = false

  private static _hookedIntoRandoIPCEvents = false

  static start() {
    if (!this._hookedIntoRandoIPCEvents) {
      RandoIPCService.events.on("connectionStateChanged", async () => {
        await LocalTrackerWebSocketService.forceRefreshAll()
      })
      this._hookedIntoRandoIPCEvents = true
    }

    this.trackedUberStatesLookupTable = {}
    for (const trackedUberState of TRACKED_UBER_STATES) {
      this.trackedUberStatesLookupTable[this.uberIdHash(trackedUberState.uberId)] = trackedUberState
    }

    if (this.updateTimerStateIntervalId !== null) {
      clearInterval(this.updateTimerStateIntervalId)
    }

    this.wss?.close()

    this.wss = new WebSocketServer({
      port: 31410, // 0 = Random free port
      host: "127.0.0.1",
    })

    this.wss.on("listening", () => {
      this.webSocketListening = true
      this.events.emit("serverStateChanged", true)
      log.info("LocalTrackerWebSocketService: Started on port " + this.port)
    })

    this.wss.on("close", () => {
      this.events.emit("serverStateChanged", false)
      this.webSocketListening = false

      setTimeout(this.start, 5000)
    })

    this.wss.on("connection", async (socket) => {
      // Send a reset and all tracked uber states on initial connection
      socket.send(makePacket(Proto.ResetTracker, {}))
      await this.forceRefresh(socket)
    })

    this.updateTimerStateIntervalId = setInterval(async () => {
      await this.reportCurrentTimerState()
    }, 60000)
  }

  static get port(): number {
    return (this.wss?.address() as AddressInfo)?.port ?? 31410
  }

  static reportUberState(state: UberState) {
    const trackedUberState = this.trackedUberStatesLookupTable[this.uberIdHash(state)]
    if (trackedUberState) {
      this.sendUpdate({
        $type: "Proto.TrackerUpdate",
        id: trackedUberState.trackingId,
        value: trackedUberState.valueConverter ? trackedUberState.valueConverter(state.value) : state.value,
      })
    }
  }

  static async reportCurrentTimerState() {
    const {
      in_game_time: inGameTime,
      async_loading_time: asyncLoadingTime,
      timer_should_run: timerShouldRun,
    } = await RandoIPCService.request("timer.get_timer_state") as {
      in_game_time: number,
      async_loading_time: number,
      timer_should_run: boolean,
    }
    this.reportTimerState(inGameTime, asyncLoadingTime, timerShouldRun)
  }

  static async reportCurrentTimerStateToClient(client: WebSocket) {
    const {
      in_game_time: inGameTime,
      async_loading_time: asyncLoadingTime,
      timer_should_run: timerShouldRun,
    } = await RandoIPCService.request("timer.get_timer_state") as {
      in_game_time: number,
      async_loading_time: number,
      timer_should_run: boolean,
    }
    this.reportTimerStateToClient(client, inGameTime, asyncLoadingTime, timerShouldRun)
  }

  static reportTimerState(inGameTime: number, asyncLoadingTime: number, timerShouldRun: boolean) {
    for (const client of this.wss?.clients || []) {
      this.reportTimerStateToClient(client, inGameTime, asyncLoadingTime, timerShouldRun)
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.reportTimerStateToClient(this.ws, inGameTime, asyncLoadingTime, timerShouldRun)
    }
  }

  static reportTimerStateToClient(client: WebSocket, inGameTime: number, asyncLoadingTime: number, timerShouldRun: boolean) {
    client.send(
      makePacket(Proto.TrackerTimerStateUpdate, {
        inGameTime,
        asyncLoadingTime,
        timerShouldRun,
      }),
    )
  }

  static sendUpdate(update: Proto.TrackerUpdate) {
    for (const client of this.wss?.clients || []) {
      client.send(makePacket(Proto.TrackerUpdate, update))
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(makePacket(Proto.TrackerUpdate, update))
    }
  }

  static sendTimerStateUpdate(update: Proto.TrackerTimerStateUpdate) {
    for (const client of this.wss?.clients || []) {
      client.send(makePacket(Proto.TrackerTimerStateUpdate, update))
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(makePacket(Proto.TrackerTimerStateUpdate, update))
    }
  }

  static async forceRefreshAll() {
    for (const client of this.wss?.clients || []) {
      await this.forceRefresh(client)
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      await this.forceRefresh(this.ws)
    }
  }

  static async forceRefresh(client: WebSocket) {
    if (!RandoIPCService.isConnected()) {
      return
    }

    const trackedValues = await RandoIPCService.getUberStates(TRACKED_UBER_STATES.map((s) => s.uberId))
    const trackerUpdates: Proto.TrackerUpdate[] = trackedValues.map(
      (value, index) => ({
        $type: "Proto.TrackerUpdate",
        id: TRACKED_UBER_STATES[index].trackingId,
        value: TRACKED_UBER_STATES[index].valueConverter ? TRACKED_UBER_STATES[index].valueConverter?.(value) ?? value : value,
      }),
    )

    for (const update of trackerUpdates) {
      client.send(makePacket(Proto.TrackerUpdate, update))
    }

    client.send(
      makePacket(Proto.TrackerFlagsUpdate, {
        flags: await RandoIPCService.getSeedFlags(),
      }),
    )

    await this.reportCurrentTimerStateToClient(client)
  }

  static stop() {
    for (const socket of this.wss?.clients || []) {
      socket.close()
    }
    this.wss?.close()
    log.info("LocalTrackerWebSocketService: Stopped")
  }

  static get isRunning() {
    return !!this.wss && this.webSocketListening
  }

  static debugSetUberState(trackingId: string, value: number) {
    const trackedUberState = TRACKED_UBER_STATES.find((t) => t.trackingId === trackingId)
    if (trackedUberState) {
      RandoIPCService.setUberState(trackedUberState.uberId.group, trackedUberState.uberId.state, value)
    }
  }

  static expose(baseUrl: string, jwt: string) {
    this.ws?.removeAllListeners()
    this.ws?.close()

    return new Promise<string>((resolve, reject) => {
      const connect = (reconnect = false) => {
        let wasConnected = false

        const url = `${baseUrl}/remote-tracker${reconnect ? "?reconnect=true" : ""}`
        log.info(`LocalTrackerWebSocketService: Connecting to ${url}`)
        const ws = new WebSocket(url)

        ws.on("open", async () => {
          ws?.send(
            makePacket(Proto.AuthenticateMessage, {
              jwt,
              clientVersion: await VersionService.getVersion(),
            }),
          )
        })

        ws.on("message", async (data) => {
          const packet = await decodePacket(data)

          if (!packet) {
            return
          }

          switch (packet.$type) {
            case Proto.SetTrackerEndpointId.$type:
              log.info("LocalTrackerWebSocketService: Connected")
              wasConnected = true
              this._remoteTrackerEndpointId = packet.endpointId
              this.ws = ws
              resolve(this._remoteTrackerEndpointId)
              await this.forceRefresh(ws)
              break
            case Proto.RequestFullUpdate.$type:
              log.info("LocalTrackerWebSocketService: Server requested full refresh")
              await this.forceRefresh(ws)
              break
          }
        })

        ws.on("close", (code, reason) => {
          if (this.ws) {
            log.info("LocalTrackerWebSocketService: Client socket closed, reconnecting in 4s...", code, reason.toString())
            setTimeout(() => connect(true), 4000)
          }
        })

        ws.on("error", (e) => {
          if (this.ws) {
            log.info("LocalTrackerWebSocketService: Client socket error, reconnecting in 4s...", e)
            setTimeout(() => connect(true), 4000)
          }
        })

        setTimeout(() => {
          if (!wasConnected) {
            ws.close()
            reject()
          }
        }, 20000)
      }
      connect()
    })
  }
}
