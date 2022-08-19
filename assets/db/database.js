import Dexie from 'dexie'
import 'dexie-observable'

export const getDb = new Promise(resolve => {
  const db = new Dexie('ori-rando-ui')

  db.version(5).stores({
    customHeaders: '$$id, name, content',
    customPresets: '$$id, name, json_data',
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
