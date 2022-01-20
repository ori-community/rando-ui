import { AddressInfo, WebSocketServer } from 'ws'
import { UberId, UberState } from '~/assets/lib/types/UberStates'
import { RandoIPCService } from '@/lib/RandoIPCService'
import { NumericMetric, ProgressionMetric } from '~/assets/lib/types/Stats'

type TrackerUberStateUpdate = {
  type: 'uber_state',
  uberState: UberState,
}

type TrackerStatsUpdate = {
  type: 'stats_metric',
  metric: NumericMetric | ProgressionMetric,
}

type TrackerUpdate = TrackerUberStateUpdate | TrackerStatsUpdate

const TRACKED_UBER_STATES: UberId[] = [
  {state: 123, group: 456},
]

export class LocalTrackerWebSocketService {
  private static ws: WebSocketServer|null = null

  static start() {
    this.ws = new WebSocketServer({
      port: 0, // Random free port
      host: '127.0.0.1',
    })

    this.ws.on('connection', async socket => {
      // Send all tracked uber states on initial connection

      const trackedValues = await RandoIPCService.getUberStates(TRACKED_UBER_STATES)
      const trackedUberStates: UberState[] = trackedValues.map((value, index) => ({
        ...TRACKED_UBER_STATES[index],
        value,
      }))

      for (const trackedUberState of trackedUberStates) {
        socket.send(JSON.stringify(trackedUberState))
      }
    })
  }

  static get port(): number {
    return (this.ws!!.address() as AddressInfo).port
  }

  static sendUpdate(update: TrackerUpdate) {
    for (const client of this.ws!!.clients) {
      client.send(JSON.stringify(update))
    }
  }
}
