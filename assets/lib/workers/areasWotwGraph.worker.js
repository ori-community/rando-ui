import registerWebWorker from 'webworker-promise/lib/register'
import {ungetterify} from '~/assets/lib/ungetterify'

registerWebWorker(async ({ areasWotwContents, locDataFileContents }) => {
  const { graph: makeGraph } = await import('@ori-rando/wotw-seedgen-wasm-ui')
  const graph = makeGraph(areasWotwContents, locDataFileContents)

  const pureGraph = ungetterify(graph)
  graph.free()

  return pureGraph
})
