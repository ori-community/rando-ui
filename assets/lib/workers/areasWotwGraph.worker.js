import registerWebWorker from 'webworker-promise/lib/register'
import { resolveGetters } from '~/assets/lib/resolveGetters'
import { getSeedgen } from '~/assets/lib/getSeedgen'

registerWebWorker(async ({ areasWotwContents, locDataFileContents }) => {
  try {
    const { graph: makeGraph } = await getSeedgen()
    const graph = makeGraph(areasWotwContents, locDataFileContents)

    const pureGraph = resolveGetters(graph)
    graph.free()
    return pureGraph
  } catch (e) {
    throw new Error(e)
  }
})
