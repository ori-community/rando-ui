import type {MultiverseInfoMessage} from "@shared/proto/messages"
import type {Ref} from "vue"
import combineURLs from "~/assets/utils/combileURLs"
import {withoutProtoType, type WithoutProtoType} from "@shared/proto/ProtoUtil"
import {base64ToUint8Array} from "~/assets/utils/base64ToUint8Array"

type MultiverseInfo = WithoutProtoType<MultiverseInfoMessage>

class MultiverseConnection {
  readonly multiverseId: number
  readonly multiverseRef: Promise<Ref<MultiverseInfo>>
  // TODO: Add Bingo data

  #multiverseRef: Ref<MultiverseInfo> | null = null
  #connectionReferenceCount: number = 0
  #webSocket: AuthenticatedWebSocketConnection | null = null

  constructor(multiverseId: number) {
    this.multiverseId = multiverseId
    this.multiverseRef = (async () => {
      const {axios} = useAxios()
      const data = (await axios.get(`/multiverses/${multiverseId}`)).data
      data.gameHandlerClientInfo = base64ToUint8Array(data.gameHandlerClientInfo)

      this.#multiverseRef = ref(data as MultiverseInfo)
      return this.#multiverseRef
    })()

    this.connectWebSocket()
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

  private async connectWebSocket(): Promise<void> {
    const runtimeConfig = useRuntimeConfig()
    this.#webSocket = await useAuthenticatedWebsocket(combineURLs(runtimeConfig.public.webApiBaseUrl, `/multiverses/${this.multiverseId}/subscribe`))
    this.#webSocket.addEventListener("message", ({message}) => {
      if (!this.#multiverseRef) {
        return
      }

      switch (message.$type) {
        case "RandoProto.MultiverseInfoMessage": {
          this.#multiverseRef.value = withoutProtoType(message)
          break
        }
      }
    })
  }
}

const multiverseConnections = new Map<number, MultiverseConnection>

export async function useMultiverse(id: MaybeRefOrGetter<number>): Promise<Ref<MultiverseInfo>> {
  let composableRef: Ref<MultiverseInfo>
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

  async function setupMultiverseCache(): Promise<Ref<MultiverseInfo>> {
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

    if (!composableRef) {
      composableRef = ref(multiverseRef.value)
    } else {
      composableRef.value = multiverseRef.value
    }

    connection.incrementRefCount()
    currentConnection = connection

    watch(multiverseRef, (value) => {
      composableRef.value = value
    })

    return composableRef
  }

  const populatedRef = await setupMultiverseCache()

  watch(() => [toValue(id), useAuthStore().jwt], async () => {
    disposeCurrentConnection()
    await setupMultiverseCache()
  })

  return populatedRef
}
