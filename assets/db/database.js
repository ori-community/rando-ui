import Dexie from 'dexie'
import 'dexie-observable'

export const db = new Dexie('ori-rando-ui')

db.version(1).stores({
  customHeaders: '$$id, name, content',
})
