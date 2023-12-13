import { AddressInfo, WebSocket, WebSocketServer } from 'ws'
import { UberId, UberState } from '~/assets/lib/types/UberStates'
import { RandoIPCService } from '@/lib/RandoIPCService'
import {
  AuthenticateMessage,
  RequestFullUpdate,
  ResetTracker, SetTrackerEndpointId,
  TrackerFlagsUpdate, TrackerTimerStateUpdate,
  TrackerUpdate,
} from '~/assets/proto/messages'
import { decodePacket, makePacket } from '~/assets/proto/ProtoUtil'
import { uiIpc } from '@/api'

type TrackedUberState = {
  uberId: UberId,
  trackingId: string,
  valueConverter?: (value: number) => number
}

type TrackedUberStatesLookupTable = {
  [uberHash: string]: TrackedUberState
}

const teleporterValueConverter = (value: number) => value & 0b1
const thresholdOf = (threshold: number) =>  (value: number) => value >= threshold ? 1 : 0

const TRACKED_UBER_STATES: TrackedUberState[] = [
  { uberId: { group: 0, state: 0 }, trackingId: 'tree_bash' },
  { uberId: { group: 0, state: 5 }, trackingId: 'tree_double_jump' },
  { uberId: { group: 0, state: 8 }, trackingId: 'tree_launch' },
  { uberId: { group: 0, state: 51 }, trackingId: 'tree_light_burst' },
  { uberId: { group: 0, state: 57 }, trackingId: 'tree_grapple' },
  { uberId: { group: 0, state: 62 }, trackingId: 'tree_flash' },
  { uberId: { group: 0, state: 77 }, trackingId: 'tree_regenerate' },
  { uberId: { group: 0, state: 97 }, trackingId: 'tree_bow' },
  { uberId: { group: 0, state: 100 }, trackingId: 'tree_sword' },
  { uberId: { group: 0, state: 101 }, trackingId: 'tree_burrow' },
  { uberId: { group: 0, state: 102 }, trackingId: 'tree_dash' },
  { uberId: { group: 0, state: 104 }, trackingId: 'tree_water_dash' },
  { uberId: { group: 0, state: 120 }, trackingId: 'tree_ancestral_light_glades' },
  { uberId: { group: 0, state: 121 }, trackingId: 'tree_ancestral_light_marsh' },

  { uberId: { group: 24922, state: 42531 }, trackingId: 'tp_midnight_burrows', valueConverter: teleporterValueConverter },
  { uberId: { group: 21786, state: 10185 }, trackingId: 'tp_inkwater_marsh', valueConverter: teleporterValueConverter },
  { uberId: { group: 11666, state: 61594 }, trackingId: 'tp_howls_den', valueConverter: teleporterValueConverter },
  { uberId: { group: 945, state: 58183 }, trackingId: 'tp_luma_pools_east', valueConverter: teleporterValueConverter },
  { uberId: { group: 945, state: 1370 }, trackingId: 'tp_luma_pools_west', valueConverter: teleporterValueConverter },
  { uberId: { group: 53632, state: 18181 }, trackingId: 'tp_wellspring', valueConverter: teleporterValueConverter },
  { uberId: { group: 28895, state: 54235 }, trackingId: 'tp_baurs_reach', valueConverter: teleporterValueConverter },
  { uberId: { group: 937, state: 26601 }, trackingId: 'tp_kwoloks_hollow', valueConverter: teleporterValueConverter },
  { uberId: { group: 18793, state: 38871 }, trackingId: 'tp_mouldwood_depths', valueConverter: teleporterValueConverter },
  { uberId: { group: 16155, state: 41465 }, trackingId: 'tp_willow_inner', valueConverter: teleporterValueConverter },
  { uberId: { group: 16155, state: 50867 }, trackingId: 'tp_willow_outer', valueConverter: teleporterValueConverter },
  { uberId: { group: 58674, state: 7071 }, trackingId: 'tp_silent_woods_west', valueConverter: teleporterValueConverter },
  { uberId: { group: 58674, state: 1965 }, trackingId: 'tp_silent_woods_wast', valueConverter: teleporterValueConverter },
  { uberId: { group: 58674, state: 10029 }, trackingId: 'tp_windswept_wastes_west', valueConverter: teleporterValueConverter },
  { uberId: { group: 20120, state: 49994 }, trackingId: 'tp_windswept_wastes_east', valueConverter: teleporterValueConverter },
  { uberId: { group: 20120, state: 41398 }, trackingId: 'tp_windtorn_ruins_outer', valueConverter: teleporterValueConverter },
  { uberId: { group: 10289, state: 4928 }, trackingId: 'tp_windtorn_ruins_inner', valueConverter: teleporterValueConverter },
  { uberId: { group: 42178, state: 42096 }, trackingId: 'tp_wellspring_glades', valueConverter: teleporterValueConverter },

  { uberId: { group: 24, state: 0 }, trackingId: 'skill_bash' },
  { uberId: { group: 24, state: 3 }, trackingId: 'skill_wall_jump' },
  { uberId: { group: 24, state: 5 }, trackingId: 'skill_double_jump' },
  { uberId: { group: 24, state: 8 }, trackingId: 'skill_launch' },
  { uberId: { group: 24, state: 14 }, trackingId: 'skill_glide' },
  { uberId: { group: 24, state: 23 }, trackingId: 'skill_water_breath' },
  { uberId: { group: 24, state: 51 }, trackingId: 'skill_light_burst' },
  { uberId: { group: 24, state: 57 }, trackingId: 'skill_grapple' },
  { uberId: { group: 24, state: 62 }, trackingId: 'skill_flash' },
  { uberId: { group: 24, state: 74 }, trackingId: 'skill_spike' },
  { uberId: { group: 24, state: 77 }, trackingId: 'skill_regenerate' },
  { uberId: { group: 24, state: 97 }, trackingId: 'skill_bow' },
  { uberId: { group: 24, state: 98 }, trackingId: 'skill_hammer' },
  { uberId: { group: 24, state: 99 }, trackingId: 'skill_torch' },
  { uberId: { group: 24, state: 100 }, trackingId: 'skill_sword' },
  { uberId: { group: 24, state: 101 }, trackingId: 'skill_burrow' },
  { uberId: { group: 24, state: 102 }, trackingId: 'skill_dash' },
  { uberId: { group: 24, state: 104 }, trackingId: 'skill_water_dash' },
  { uberId: { group: 24, state: 106 }, trackingId: 'skill_shuriken' },
  { uberId: { group: 24, state: 115 }, trackingId: 'skill_blaze' },
  { uberId: { group: 24, state: 116 }, trackingId: 'skill_sentry' },
  { uberId: { group: 24, state: 118 }, trackingId: 'skill_flap' },
  { uberId: { group: 24, state: 120 }, trackingId: 'skill_ancestral_light_glades' },
  { uberId: { group: 24, state: 121 }, trackingId: 'skill_ancestral_light_marsh' },
  { uberId: { group: 6, state: 2000 }, trackingId: 'skill_clean_water' },

  { uberId: { group: 4, state: 70 }, trackingId: 'melting_bow'},
  { uberId: { group: 4, state: 71 }, trackingId: 'melting_blaze'},
  { uberId: { group: 4, state: 72 }, trackingId: 'melting_sword'},
  { uberId: { group: 4, state: 73 }, trackingId: 'melting_hammer'},
  { uberId: { group: 4, state: 74 }, trackingId: 'melting_spike'},
  { uberId: { group: 4, state: 75 }, trackingId: 'melting_shuriken'},

  { uberId: { group: 9, state: 2 }, trackingId: 'launch_fragments_count' },
  { uberId: { group: 9, state: 4 }, trackingId: 'launch_fragments_required' },

  { uberId: { group: 5, state: 0 }, trackingId: 'resource_spirit_light' },
  { uberId: { group: 5, state: 1 }, trackingId: 'resource_gorlek_ore' },
  { uberId: { group: 14, state: 5 }, trackingId: 'resource_gorlek_ore_collected' },
  { uberId: { group: 5, state: 2 }, trackingId: 'resource_keystones' },

  { uberId: { group: 23, state: 500 }, trackingId: 'relic_count_total' },
  { uberId: { group: 23, state: 501 }, trackingId: 'relic_count' },
  { uberId: { group: 23, state: 502 }, trackingId: 'tree_count' },
  { uberId: { group: 23, state: 503 }, trackingId: 'wisp_count' },
  { uberId: { group: 23, state: 504 }, trackingId: 'quest_count' },
  { uberId: { group: 23, state: 505 }, trackingId: 'relic_current_area_uncollected' },

  { uberId: { group: 16155, state: 42976 }, trackingId: 'heart_wind_spinners' },
  { uberId: { group: 16155, state: 54940 }, trackingId: 'heart_spinning_lasers' },
  { uberId: { group: 16155, state: 24290 }, trackingId: 'heart_upper_heart' },
  { uberId: { group: 16155, state: 3588 }, trackingId: 'heart_burrow_heart' },
  { uberId: { group: 16155, state: 12971 }, trackingId: 'heart_willow_laser', valueConverter: thresholdOf(4) },
  { uberId: { group: 16155, state: 65277 }, trackingId: 'heart_redirect_puzzle' },
  { uberId: { group: 16155, state: 41488 }, trackingId: 'heart_boulder_escape' },
  { uberId: { group: 16155, state: 60752 }, trackingId: 'heart_lower_left' },

  { uberId: { group: 34543, state: 11226 }, trackingId: 'game_finished' },

  { uberId: { group: 14019, state: 44578 }, trackingId: 'quest_rebuild_glades' },

  { uberId: { group: 42178, state: 16825 }, trackingId: 'builder_project_spirit_well' },
  { uberId: { group: 42178, state: 51230 }, trackingId: 'builder_project_houses' },
  { uberId: { group: 42178, state: 18751 }, trackingId: 'builder_project_remove_thorns' },
  { uberId: { group: 42178, state: 23607 }, trackingId: 'builder_project_houses_b' },
  { uberId: { group: 42178, state: 40448 }, trackingId: 'builder_project_houses_c' },
  { uberId: { group: 42178, state: 16586 }, trackingId: 'builder_project_open_cave' },
  { uberId: { group: 42178, state: 15068 }, trackingId: 'builder_project_beautify' },

  // Maybe for later...
  { uberId: { group: 945, state: 49747 }, trackingId: 'wisp_pools' },
  { uberId: { group: 28895, state: 25522 }, trackingId: 'wisp_reach' },
  { uberId: { group: 18793, state: 63291 }, trackingId: 'wisp_depths' },
  { uberId: { group: 46462, state: 59806 }, trackingId: 'wisp_hollow' },
  { uberId: { group: 10289, state: 22102 }, trackingId: 'wisp_ruins' },
]

export class LocalTrackerWebSocketService {
  private static wss: WebSocketServer | null = null
  private static ws: WebSocket | null = null

  private static trackedUberStatesLookupTable: TrackedUberStatesLookupTable = {}

  private static _remoteTrackerEndpointId: string | null = null

  private static updateTimerStateIntervalId: NodeJS.Timeout | null = null

  public static get remoteTrackerEndpointId() {
    return this._remoteTrackerEndpointId
  }

  private static uberIdHash(id: UberId) {
    return String(id.group) + '.' + String(id.state)
  }

  private static webSocketListening = false

  private static _hookedIntoRandoIPCEvents = false

  static start() {
    if (!this._hookedIntoRandoIPCEvents) {
      RandoIPCService.events.onConnect.on(async () => {
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
      host: '127.0.0.1',
    })

    this.wss.on('listening', () => {
      this.webSocketListening = true
      uiIpc.queueSend('localTracker.setIsRunning', true)
      console.log('LocalTrackerWebSocketService: Started on port ' + this.port)
    })

    this.wss.on('close', () => {
      uiIpc.queueSend('localTracker.setIsRunning', false)
      this.webSocketListening = false

      setTimeout(this.start, 5000)
    })

    this.wss.on('connection', async (socket) => {
      // Send a reset and all tracked uber states on initial connection
      socket.send(makePacket(ResetTracker))
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
      this.sendUpdate(
        TrackerUpdate.fromJSON({
          id: trackedUberState.trackingId,
          value: trackedUberState.valueConverter ? trackedUberState.valueConverter(state.value) : state.value,
        }),
      )
    }
  }

  static async reportCurrentTimerState() {
    const { in_game_time: inGameTime, async_loading_time: asyncLoadingTime, timer_should_run: timerShouldRun } = await RandoIPCService.request('timer.get_timer_state')
    this.reportTimerState(inGameTime, asyncLoadingTime, timerShouldRun)
  }

  static async reportCurrentTimerStateToClient(client: WebSocket) {
    const { in_game_time: inGameTime, async_loading_time: asyncLoadingTime, timer_should_run: timerShouldRun } = await RandoIPCService.request('timer.get_timer_state')
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
      makePacket(TrackerTimerStateUpdate, {
        inGameTime,
        asyncLoadingTime,
        timerShouldRun,
      }),
    )
  }

  static sendUpdate(update: TrackerUpdate) {
    for (const client of this.wss?.clients || []) {
      client.send(makePacket(TrackerUpdate, update))
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(makePacket(TrackerUpdate, update))
    }
  }

  static sendTimerStateUpdate(update: TrackerTimerStateUpdate) {
    for (const client of this.wss?.clients || []) {
      client.send(makePacket(TrackerTimerStateUpdate, update))
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(makePacket(TrackerTimerStateUpdate, update))
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
    const trackerUpdates: TrackerUpdate[] = trackedValues.map((value, index) =>
      TrackerUpdate.fromJSON({
        id: TRACKED_UBER_STATES[index].trackingId,
        value: TRACKED_UBER_STATES[index].valueConverter ? TRACKED_UBER_STATES[index].valueConverter?.(value) ?? value : value,
      }),
    )

    for (const update of trackerUpdates) {
      client.send(makePacket(TrackerUpdate, update))
    }

    client.send(
      makePacket(TrackerFlagsUpdate, {
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
    console.log('LocalTrackerWebSocketService: Stopped')
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
      const connect = (reconnect: boolean = false) => {
        let wasConnected = false

        const url = `${baseUrl}/remote-tracker${reconnect ? '?reconnect=true' : ''}`
        console.log(`LocalTrackerWebSocketService: Connecting to ${url}`)
        const ws = new WebSocket(url)

        ws.on('open', () => {
          ws?.send(
            makePacket(AuthenticateMessage, {
              jwt,
            }),
          )
        })

        ws.on('message', async (data) => {
          const packet = await decodePacket(data)

          if (!packet) {
            return
          }

          switch (packet.$type) {
            case SetTrackerEndpointId.$type:
              console.log('LocalTrackerWebSocketService: Connected')
              wasConnected = true
              this._remoteTrackerEndpointId = (packet as SetTrackerEndpointId).endpointId
              this.ws = ws
              resolve(this._remoteTrackerEndpointId)
              await this.forceRefresh(ws)
              break
            case RequestFullUpdate.$type:
              console.log('LocalTrackerWebSocketService: Server requested full refresh')
              await this.forceRefresh(ws)
              break
          }
        })

        ws.on('close', (code, reason) => {
          if (this.ws) {
            console.log('LocalTrackerWebSocketService: Client socket closed, reconnecting in 4s...', code, reason.toString())
            setTimeout(() => connect(true), 4000)
          }
        })

        ws.on('error', (e) => {
          if (this.ws) {
            console.log('LocalTrackerWebSocketService: Client socket error, reconnecting in 4s...', e)
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
