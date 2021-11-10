import Dexie from 'dexie'
import 'dexie-observable'
import zones from './zones.yaml'

export const db = new Dexie('ori-rando-ui')

// region Version 1: Custom headers
db.version(1).stores({
  customHeaders: '$$id, name, content',
})
// endregion

// region Version 2: Stats
const PER_ZONE_STATS = [
  'pickups',
  'time',
  'ppm',
  'deaths',
]

const zoneStats = zones.map(zone => (
  PER_ZONE_STATS.map(zoneStat => `${zoneStat}_${zone.id}`)
))

db.version(2).stores({
  customHeaders: '$$id, name, content',
  gameStatGroups: '$$id, name',
  gameStats: '$$id, group_id, finished_at, time, deaths, time_lost_to_deaths, warps_used, global_ppm, peak_ppm, ' + zoneStats.join(', ')
})
// endregion
