import type {Ref} from "vue"
import combineURLs from "~/assets/utils/combileURLs"
import {withoutProtoType} from "@shared/proto/ProtoUtil"
import {base64ToUint8Array} from "~/assets/utils/base64ToUint8Array"
import type {BingoBoard, BingoData, BingoUniverseInfo, MultiverseInfo, SeedInfo} from "@shared/types/http-api"
import {Proto} from "@shared/proto"

type MultiverseRefs = {
  multiverse: Ref<MultiverseInfo>,
  seed: Ref<SeedInfo | null>,
  bingoBoard: Ref<BingoBoard>,
  bingoUniverses: Ref<BingoUniverseInfo[]>
}

class MultiverseConnection {
  readonly multiverseId: number
  readonly multiverseRef: Promise<Ref<MultiverseInfo>>
  readonly seedRef: Ref<SeedInfo | null> = ref(null)
  readonly bingoBoardRef: Ref<BingoBoard | null> = ref(null)
  readonly bingoUniversesRef: Ref<BingoUniverseInfo[]> = ref([])

  #connectionReferenceCount: number = 0
  #webSocket: AuthenticatedWebSocketConnection | null = null

  constructor(multiverseId: number) {
    this.multiverseId = multiverseId
    this.multiverseRef = (async () => {
      const {axios} = useAxios()
      const data = (await axios.get(`/multiverses/${multiverseId}`)).data
      data.gameHandlerClientInfo = base64ToUint8Array(data.gameHandlerClientInfo)

      const multiverseRef = ref(data as MultiverseInfo)
      this.#watchDependencies(multiverseRef)

      return multiverseRef
    })()

    this.#connectWebSocket()
  }

  #watchDependencies(multiverseRef: Ref<MultiverseInfo>) {
    watch(() => multiverseRef.value.seedId, async () => {
      await this.#fetchSeed()
    }, {immediate: true})

    watch(() => multiverseRef.value.hasBingoBoard, async () => {
      await this.#fetchBingoData()
    }, {immediate: true})
  }

  async #fetchSeed() {
    const seedId = (await this.multiverseRef).value.seedId

    if (!seedId) {
      this.seedRef.value = null
      return
    }

    const {axios} = useAxios()
    this.seedRef.value = (await axios.get(`/seeds/${seedId}`)).data as SeedInfo
  }

  async #fetchBingoData() {
    const hasBingoBoard = (await this.multiverseRef).value.hasBingoBoard

    if (!hasBingoBoard) {
      this.bingoBoardRef.value = null
      return
    }

    const {axios} = useAxios()
    const data = (await axios.get(`/multiverses/${this.multiverseId}/bingo`)).data as BingoData
    this.bingoBoardRef.value = data.board
    this.bingoUniversesRef.value = data.universes
  }

  /**
   * Increments the reference counter (i.e. how many instances of useMultiverse are targeting this multiverse)
   */
  public incrementRefCount() {
    this.#connectionReferenceCount++
  }

  /**
   * Decrements the reference counter. If the reference counter is <=0, it disposes all resources and returns true.
   */
  public decrementRefCount(): boolean {
    this.#connectionReferenceCount--
    const shouldDispose = this.#connectionReferenceCount <= 0

    if (shouldDispose) {
      this.#webSocket?.close()
    }

    return shouldDispose
  }

  async #connectWebSocket(): Promise<void> {
    const runtimeConfig = useRuntimeConfig()
    this.#webSocket = await useAuthenticatedWebsocket(combineURLs(runtimeConfig.public.webApiBaseUrl, `/multiverses/${this.multiverseId}/subscribe`))
    this.#webSocket.addEventListener("message", async ({message}) => {
      const multiverseRef = await this.multiverseRef

      switch (message.$type) {
        case Proto.MultiverseInfoMessage.$type: {
          multiverseRef.value = withoutProtoType(message)
          break
        }
        case Proto.SyncBoardMessage.$type: {
          if (!message.board) {
            return
          }

          this.bingoBoardRef.value = withoutProtoType(message.board)
          break
        }
        case Proto.SyncBingoUniversesMessage.$type: {
          this.bingoUniversesRef.value = message.bingoUniverses.map(u => withoutProtoType(u))
          break
        }
      }
    })
  }
}

const multiverseConnections = new Map<number, MultiverseConnection>

export async function useMultiverse(id: MaybeRefOrGetter<number>): Promise<MultiverseRefs> {
  let composableRefs: MultiverseRefs
  let currentConnection: MultiverseConnection | null = null

  function disposeCurrentConnection(): void {
    if (currentConnection?.decrementRefCount()) {
      multiverseConnections.delete(currentConnection?.multiverseId)
    }
    currentConnection = null
  }

  onScopeDispose(() => {
    disposeCurrentConnection()
  })

  async function setupMultiverseCache(): Promise<MultiverseRefs> {
    if (currentConnection != null) {
      disposeCurrentConnection()
    }

    const idValue = toValue(id)

    let connection = multiverseConnections.get(idValue)
    if (connection === undefined) {
      connection = new MultiverseConnection(idValue)
      multiverseConnections.set(idValue, connection)
    }

    const multiverseRef = await connection.multiverseRef

    if (!composableRefs) {
      composableRefs = {
        multiverse: ref(multiverseRef.value),
        seed: ref(connection.seedRef.value),
        bingoBoard: ref(connection.bingoBoardRef.value),
        bingoUniverses: ref(connection.bingoUniversesRef.value),
      }
    }

    connection.incrementRefCount()
    currentConnection = connection

    watchEffect(() => {
      composableRefs.multiverse.value = multiverseRef.value
      composableRefs.seed.value = connection.seedRef.value
      composableRefs.bingoBoard.value = connection.bingoBoardRef.value
      composableRefs.bingoUniverses.value = connection.bingoUniversesRef.value
    })

    return composableRefs
  }

  const populatedRefs = await setupMultiverseCache()

  watch(() => [toValue(id), useAuthStore().jwt], async () => {
    disposeCurrentConnection()
    await setupMultiverseCache()
  })

  return populatedRefs
}
