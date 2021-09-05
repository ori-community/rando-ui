import { makePacket } from '~/assets/proto/RandoProtoUtil'
import { RandoProto } from '~/assets/proto/RandoProto'

export class WebSocketFactory {
  static jwt = null

  static create(endpoint) {
    return new Promise(resolve => {
      let connected = false
      const ws = new WebSocket(`${process.env.WS_BASE_URL}${endpoint}`)

      ws.addEventListener('open', () => {
        ws.send(makePacket(RandoProto.Authenticate, {
          jwt: this.jwt,
        }))

        resolve(ws)
        connected = true
      })

      // Prevent dangling connections
      setTimeout(() => {
        if (!connected) {
          ws.close()
        }
      }, 20000)
    })
  }
}
