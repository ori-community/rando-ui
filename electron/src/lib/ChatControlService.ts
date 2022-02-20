import { BrowserWindow } from 'electron'
import path from 'path'
import { getElectronUrl, uiIpc } from '@/api'
import { RandoIPCService } from '@/lib/RandoIPCService'
import { Jexl } from 'jexl'
import { ElectronAuthProvider } from '@twurple/auth-electron'
import { PubSubClient, PubSubListener, PubSubRedemptionMessage } from '@twurple/pubsub'
import { AuthProvider } from '@twurple/auth'
import { ChatClient } from '@twurple/chat'
import { ApiClient, UserIdResolvable } from '@twurple/api'

const TWITCH_CLIENT_ID = '3d3x1rsrwtwz0db4tb9ou9g587677j'
const TWITCH_REDIRECT_URI = 'https://wotw.orirando.com/api/twitch-login'

const electronAuthProvider = new ElectronAuthProvider({
  clientId: TWITCH_CLIENT_ID,
  redirectUri: TWITCH_REDIRECT_URI,
})

export class ChatControlService {
  private static pubsubListener: PubSubListener | null = null
  private static chatClient: ChatClient | null = null
  private static apiClient: ApiClient | null = null
  private static user: UserIdResolvable | null = null

  static async openChatControl() {
    const window = new BrowserWindow({
      width: 750,
      height: 750,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: Boolean(process.env.ELECTRON_NODE_INTEGRATION),
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
      },
    })

    await window.loadURL(getElectronUrl(`/electron/windows/chat-control`))
  }

  static async runScript(script: string, params: string[] = []) {
    if (!RandoIPCService.isConnected()) {
      console.log('Ignoring chat action, IPC not connected')
      return
    }

    const context: any = {
      params,
      vars: {},
    }

    try {
      const runner = new Jexl()
      runner.addFunction('get', async (...args) => {
        console.log(args)
        return RandoIPCService.getUberState(Number(args[0]), Number(args[1]))
      })
      runner.addFunction('set', async (...args) => {
        return RandoIPCService.setUberState(Number(args[0]), Number(args[1]), Number(args[2]))
      })
      runner.addFunction('var', (...args) => {
        context.vars[args[0]] = args[1]
      })
      runner.addFunction('wait', async (...args) => {
        await new Promise(resolve => setTimeout(resolve, Number(args[0]) * 1000))
      })
      runner.addFunction('action', async (...args) => {
        await RandoIPCService.emit('action', {action_id: args[0], pressed: Boolean(args[1])})
      })
      runner.addFunction('setVelocity', async (...args) => {
        console.log(args)
        await RandoIPCService.emit('set_velocity', {
          x: Number(args[0]),
          y: Number(args[1]),
          z: 0,
        })
      })
      runner.addFunction('getVelocity', async () => {
        await RandoIPCService.request('get_velocity')
      })
      runner.addFunction('random', (...args) => {
        switch (args.length) {
          case 0:
            return Math.random()
          case 1:
            return Math.random() * (Number(args[0]) ?? 1)
          default:
            return Number(args[0]) + Math.random() * (Number(args[1]) - Number(args[0]))
        }
      })

      for (const line of script.split('\n')) {
        await runner.eval(line, context)
      }
    } catch (e) {
      console.error(e)
    }
  }

  static get isConnected() {
    return this.chatClient?.isConnected && this.user !== null && this.apiClient !== null
  }

  static async connectTwitchAccount() {
    await this.disconnectTwitchAccount()

    try {
      const authProvider: AuthProvider = electronAuthProvider

      electronAuthProvider.allowUserChange()
      await electronAuthProvider.getAccessToken([
        'channel:manage:redemptions',
        'channel:read:redemptions',
        'chat:read',
        'chat:edit',
      ])

      const pubSubClient = new PubSubClient()
      this.apiClient = new ApiClient({ authProvider });

      const user = await this.apiClient.users.getMe()
      this.user = user

      this.chatClient = new ChatClient({ authProvider, channels: [user.name] });

      const userId = await pubSubClient.registerUserListener(authProvider)

      this.pubsubListener = await pubSubClient.onRedemption(userId, (message: PubSubRedemptionMessage) => {
        uiIpc.queueSend('chatControl.onRedemption', {
          user: message.userName,
          message: message.message,
          reward: {
            id: message.rewardId,
            title: message.rewardTitle,
            cost: message.rewardCost,
          }
        })
      })

      this.chatClient.onMessage((channel, user, message) => {
        uiIpc.queueSend('chatControl.onMessage', { user, message })
      })
      await this.chatClient.connect()
    } catch (e) {
      console.log(e)
    }

    uiIpc.queueSend('chatControl.setConnected', this.isConnected)
  }

  static async disconnectTwitchAccount() {
    await this.chatClient?.quit()
    await this.pubsubListener?.remove()
    this.chatClient = null
    this.pubsubListener = null
  }

  static async getRewards() {
    return this.isConnected
      ? (await this.apiClient!!.channelPoints.getCustomRewards(this.user!!)).map(r => ({
        title: r.title,
        id: r.id,
        cost: r.cost,
      }))
      : []
  }
}
