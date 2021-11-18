import { Data } from 'dataclass'
import {zones} from '@/assets/db/zones'

interface ZoneStat {
  zoneId: number,
  totalPickups: number,
  pickups: number,
  deaths: number,
  time: number,
}

export class Stats extends Data {
  seedData: string = ''
  startTime: Date|null = null
  endTime: Date|null = null
  timeLostToDeaths: number = 0
  zones: ZoneStat[] = zones.map(zone => ({
    zoneId: zone.id,
    totalPickups: 0,
    pickups: 0,
    deaths: 0,
    time: 0,
  }))

  get totalTime() {
    if (this.startTime === null) {
      return 0
    }

    if (this.endTime === null) {
      return (Date.now() - this.startTime.getTime()) / 1000
    }

    return (this.endTime.getTime() - this.startTime.getTime()) / 1000
  }

  get pickups() {
    return this.zones.reduce((sum, zoneStat) => sum + zoneStat.pickups, 0)
  }

  get totalPickups() {
    return this.zones.reduce((sum, zoneStat) => sum + zoneStat.totalPickups, 0)
  }

  get deaths() {
    return this.zones.reduce((sum, zoneStat) => sum + zoneStat.deaths, 0)
  }
}

export class StatsCollector {

}
