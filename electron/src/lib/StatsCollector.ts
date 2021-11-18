import { zones } from '~/assets/db/zones'
import { DataWithGetters } from '@/lib/DataWithGetters'

interface ZoneStat {
  totalPickups: number,
  pickups: number,
  deaths: number,
  time: number,
}

export class Stats extends DataWithGetters {
  seedData: string = ''
  startTime: Date | null = null
  endTime: Date | null = null
  timeLostToDeaths: number = 0
  peakPpmTime: number = 0
  peakPpm: number = 0

  zones: { [zoneId: number]: ZoneStat } = zones.reduce((acc, zone) => {
    acc[zone.id] = {
      totalPickups: 0,
      pickups: 0,
      deaths: 0,
      time: 0,
    }
    return acc
  }, {} as { [zoneId: number]: ZoneStat })

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
    return Object.values(this.zones).reduce((sum, zoneStat) => sum + zoneStat.pickups, 0)
  }

  get totalPickups() {
    return Object.values(this.zones).reduce((sum, zoneStat) => sum + zoneStat.totalPickups, 0)
  }

  get deaths() {
    return Object.values(this.zones).reduce((sum, zoneStat) => sum + zoneStat.deaths, 0)
  }

  get ppm() {
    if (this.totalTime > 0) {
      return 0
    }

    return this.pickups / this.totalTime
  }
}

export class StatsCollector {
  stats?: Stats

  constructor(stats: Stats) {
    this.stats = stats
  }
}
