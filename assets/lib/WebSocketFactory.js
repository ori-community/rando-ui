import { makePacket } from '~/assets/proto/RandoProtoUtil'
import { RandoProto } from '~/assets/proto/RandoProto'

export class WebSocketFactory {
  static jwt = null

  static create(endpoint, $paths) {
    return new Promise((resolve, reject) => {
      let connected = false
      const ws = new WebSocket(`${$paths.WS_BASE_URL}${endpoint}`)

      ws.addEventListener('open', () => {
        ws.send(makePacket(RandoProto.AuthenticateMessage, {
          jwt: this.jwt,
        }))

        resolve(ws)
        connected = true
      })

      ws.addEventListener('error', reject)

      // Prevent dangling connections
      setTimeout(() => {
        if (!connected) {
          ws.close()
        }
      }, 20000)
    })
  }
}
