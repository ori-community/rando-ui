import { getDb } from '~/assets/db/database'
import { EventBus } from '~/assets/lib/EventBus'

export async function downloadHeaderToCustom(axios, headerName, displayName){
  try {
    const content = await fetchServerHeaderContent(axios, headerName)
    await insertCustomHeader(displayName, content)
  } catch (e) {
    console.error(e)
    EventBus.$emit('notification', {
      message: 'An error occured while trying to download the header',
      color: 'error'
    })
  }
}

async function fetchServerHeaderContent(axios, headerName) {
  return await axios.$get(`/seedgen/headers/${headerName}/file`)
}

export async function insertCustomHeader(headerName, headerContent){
  const headers = await (await getDb).customHeaders.toArray()

  // get unique name so the inserted header is easier to find
  let targetName = headerName
  let nextSuffixNumber = 1
  while (headers.some(h => h.name === targetName)) {
    targetName = `${headerName} (${nextSuffixNumber})`
    nextSuffixNumber++
  }

  await saveCustomHeader(null, targetName, headerContent)
}

export async function saveCustomHeader(headerId, headerName, headerContent){
  const headerPayload = {
    name: headerName,
    content: headerContent,
  }

  if (!headerId) {
    await (await getDb).customHeaders.add(headerPayload)
  } else {
    await (await getDb).customHeaders.update(headerId, headerPayload)
  }
}
