import net from 'net'

const PIPE_NAME = 'wotw_rando'
const PIPE_PATH = '\\\\.\\pipe\\'

export class RandoIPCService {
  socket = null

  static connect() {
    if (this.socket !== null && this.socket.readyState !== 'open') {
      this.socket.destroy();
    }

    return new Promise((resolve => {
      this.socket = net.createConnection(PIPE_PATH + PIPE_NAME, () => {
        console.log('RandoIPC: Connected')
        resolve()
      })
    }))
  }

  static send(message) {
    this.socket.write(message + '\r\n');
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
