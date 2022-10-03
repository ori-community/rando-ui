import registerWebWorker from 'webworker-promise/lib/register'
import {resolveGetters} from '~/assets/lib/resolveGetters'

registerWebWorker(async ({ headers }) => {
  try {
    const seedgen = await import('@ori-rando/wotw-seedgen-wasm-ui')

    const availableHeaders = []

    for (const header of headers) {
      const annotations = seedgen.parse_annotations(header.content)
      const documentation = seedgen.parse_documentation(header.content)
      const parameters = seedgen.parse_parameters(header.content)

      /** @var {ParsedHeader} */
      const parsedHeader = {
        name: header.name,
        displayName: documentation.name,
        description: documentation.description,
        category: annotations.category,
        hidden: annotations.hide,
        content: header.content,
        parameters: parameters.map((p) => resolveGetters(p)),
      }

      availableHeaders.push(parsedHeader)

      annotations.free()
      documentation.free()
      parameters.forEach(p => p.free())
    }

    return availableHeaders
  } catch (e) {
    throw new Error(e)
  }
})
