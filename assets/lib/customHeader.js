import { getDb } from '~/assets/db/database'

export function downloadHeaderToCustom(axios, headerName){
  const serverHeader = fetchServerHeader(axios, headerName)
  saveCustomHeader(null, serverHeader.name, serverHeader.content)
}
export async function fetchServerHeader(axios, headerName) {
  console.info(headerName)
  return await axios.$get('/seedgen/headers', headerName)
}
export async function insertCustomHeader(header){
  const headers = await (await getDb).customHeaders.toArray()

  // get free name so the new header does not get the same name as source
  let freeName = ''
  let count = -1
  do {
    count++
    const comparisonName = header.name + `${count > 0 ? ` (${count.toString()})` : '' }`
    if (!headers.find(element => element.name === comparisonName)){
      freeName = comparisonName
    }
  } while (!freeName)

  saveCustomHeader(null, freeName, header.content)
}
export async function saveCustomHeader(headerId, headerName, headercontent){
  const headerPayload = {
    name: headerName,
    content: headercontent,
  }

  if (!headerId) {
    await (await getDb).customHeaders.add(headerPayload)
  } else {
    await (await getDb).customHeaders.update(headerId, headerPayload)
  }
}