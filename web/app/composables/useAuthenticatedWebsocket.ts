import {decodePacket, makePacket, type PacketType} from "@shared/proto/ProtoUtil"
import {AuthenticateMessage} from "@shared/proto/messages"
import {TypedEventTarget} from "typescript-event-target"

class AuthenticatedWebSocketMessageEvent extends Event {
  readonly message: PacketType

  constructor(message: PacketType) {
    super("message", {})
    this.message = message
  }
}

interface AuthenticatedWebSocketEventMap {
  message: AuthenticatedWebSocketMessageEvent
}

export class AuthenticatedWebSocketConnection extends TypedEventTarget<AuthenticatedWebSocketEventMap> {
  readonly #url: string
  #ws: WebSocket | null = null
  #reconnectTimeoutId: null | ReturnType<typeof setTimeout> = null

  constructor(url: string) {
    super()
    this.#url = url
  }

  /**
   * Connect the WebSocket and authenticate. The returned Promise resolves once the WebSocket is authenticated
   * or on connection if no JWT is present.
   * This function needs to be called from a component lifecycle context.
   */
  public async connectAndWaitForAuthentication(): Promise<void> {
    const authStore = useAuthStore()
    const electronApi = useElectronApi()
    const jwt = authStore.jwt
    const protocolVersion = await electronApi?.updater.getVersion.query() ?? "4.33.0"
    let retriesSinceLastSuccessfulAttempt = 0

    const connectWebSocket = () => new Promise<void>((resolve) => {
      const ws = new WebSocket(this.#url)

      if (this.#ws) {
        this.#ws.close()
      }

      this.#ws = ws

      const finalizeWebSocketSetup = () => {
        // Set up the event listener to automatically decode incoming packets and forward
        // them to the typed event target
        ws.addEventListener("message", async event => {
          const packet = await decodePacket(event.data)

          if (packet === null) {
            return
          }

          this.dispatchTypedEvent("message", new AuthenticatedWebSocketMessageEvent(packet))
        })

        retriesSinceLastSuccessfulAttempt = 0
        resolve()
      }

      ws.addEventListener("open", async () => {
        // If we have a JWT, send it as the first message
        if (jwt !== null) {
          ws.send(
            makePacket(AuthenticateMessage, {
              jwt,
              clientVersion: protocolVersion,
            })
          )
        }

        finalizeWebSocketSetup()
      })

      ws.addEventListener("error", (event) => {
        console.error("WebSocket failed to connect:", event)
      })

      ws.addEventListener("close", () => {
        // If this is not the currently active WebSocket, don't try to reconnect
        if (ws !== this.#ws) {
          return
        }

        // ...otherwise reconnect with exponential back-off (max 60s)
        const reconnectDelay = Math.min(60, retriesSinceLastSuccessfulAttempt * retriesSinceLastSuccessfulAttempt)

        console.warn(`WebSocket connection closed, reconnecting in ${reconnectDelay} seconds`)
        this.#reconnectTimeoutId = setTimeout(() => {
          connectWebSocket()
        }, reconnectDelay)

        retriesSinceLastSuccessfulAttempt++
      })
    })

    await connectWebSocket()
  }

  /**
   * Close the websocket
   */
  public close() {
    if (this.#reconnectTimeoutId !== null) {
      clearTimeout(this.#reconnectTimeoutId)
      this.#reconnectTimeoutId = null
    }

    const ws = this.#ws
    this.#ws = null
    ws?.close()
  }
}

/**
 * Create a new AuthenticatedWebSocketConnection to a given URL.
 * The AuthenticatedWebSocketConnection is returned once connected and authenticated.
 * The connection is automatically aborted on watcher cleanup.
 * @param url The URL to connect to
 */
export async function useAuthenticatedWebsocket(url: string): Promise<AuthenticatedWebSocketConnection> {
  const connection = new AuthenticatedWebSocketConnection(url)

  onWatcherCleanup(() => {
    connection.close()
  }, true)

  await connection.connectAndWaitForAuthentication()
  return connection
}
