import { getDb } from '~/assets/db/database'

export async function insertCustomHeader(header){
  const headers = await (await getDb).customHeaders.toArray()

  // get free name so the new header does not get the same name as source
  let newName = header.name
  let foundFreeName = false
  let count = -1
  do {
    count++
    let checkName = ''
    if (count === 0){checkName = newName} else {checkName = newName + " (" + count.toString() + ")"}
    const found = headers.find(element => element.name === checkName)

    if (!found){
      newName = checkName
      foundFreeName = true
    }
  } while (foundFreeName === false)

  saveCustomHeader(null, newName, header.content)
}
export function downloadHeaderToCustom(headerName, displayName){
  saveCustomHeader(null, displayName, 'Test')
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