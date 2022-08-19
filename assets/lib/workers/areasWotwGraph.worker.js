import registerWebWorker from 'webworker-promise/lib/register'
import {resolveGetters} from '~/assets/lib/resolveGetters'

registerWebWorker(async ({ areasWotwContents, locDataFileContents }) => {
  try {
    const { graph: makeGraph } = await import('@ori-rando/wotw-seedgen-wasm-ui')
    const graph = makeGraph(areasWotwContents, locDataFileContents)

    const pureGraph = resolveGetters(graph)
    graph.free()
    return pureGraph
  } catch (e) {
    throw new Error(e)
  }
})
