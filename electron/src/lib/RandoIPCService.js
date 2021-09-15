import net from 'net'

const PIPE_NAME = 'wotw_rando'
const PIPE_PATH = '\\\\.\\pipe\\'

let socket = null

export class RandoIPCService {
  static connect() {
    if (socket !== null && socket.readyState !== 'open') {
      socket.destroy();
    }

    return new Promise((resolve => {
      socket = net.createConnection(PIPE_PATH + PIPE_NAME, () => {
        console.log('RandoIPC: Connected')
        resolve()
      })
    }))
  }

  static send(message) {
    socket.write(message + '\r\n');
  }

  static async trySend(message) {
    try {
      await this.connect()
      this.send(message)
    } catch (e) {
      console.error('RandoIPC error:', e)
    }
  }
}
