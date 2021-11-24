import Dexie from 'dexie'
import 'dexie-observable'
import zones from './zones.yaml'

export const getDb = new Promise(resolve => {
  const db = new Dexie('ori-rando-ui')

  const PER_ZONE_STATS = [
    'pickups',
    'time',
    'ppm',
    'deaths',
  ]

  const zoneStats = zones.map(zone => (
    PER_ZONE_STATS.map(zoneStat => `${zoneStat}_${zone.id}`)
  ))

  db.version(3).stores({
    customHeaders: '$$id, name, content',
    gameStats: '$$id, group_id, finished_at, time, deaths, time_lost_to_deaths, warps_used, global_ppm, peak_ppm, ' + zoneStats.join(', ')
  })

  db.open()
    .then(resolve)
    .catch(Dexie.VersionError, e => {
      console.warn('Incompatible DB schema, resetting DB', e)
      db.close()

      // This is beautiful
      db.delete().then(() => {
        window.location.reload()
      })
    })
})
