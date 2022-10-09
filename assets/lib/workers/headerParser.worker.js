import registerWebWorker from 'webworker-promise/lib/register'
import { resolveGetters } from '~/assets/lib/resolveGetters'

registerWebWorker(async ({ headers }) => {
  try {
    const seedgen = await import('@ori-rando/wotw-seedgen-wasm-ui')

    /** @var {{string: ParsedHeader}} */
    const parsedHeadersByName = {}

    for (const header of headers) {
      const annotations = seedgen.parse_annotations(header.content)
      const documentation = seedgen.parse_documentation(header.content)
      const parameters = seedgen.parse_parameters(header.content)

      const parametersByIdentifier = {}

      for (const parameter of parameters) {
        parametersByIdentifier[parameter.identifier] = resolveGetters(parameter)
      }

      parsedHeadersByName[header.name] = {
        name: header.name,
        displayName: documentation.name,
        description: documentation.description,
        category: annotations.category,
        hidden: annotations.hide,
        content: header.content,
        parametersByIdentifier,
      }

      annotations.free()
      documentation.free()
      parameters.forEach((p) => p.free())
    }

    return parsedHeadersByName
  } catch (e) {
    throw new Error(e)
  }
})
