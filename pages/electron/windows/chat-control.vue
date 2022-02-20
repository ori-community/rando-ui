<template>
  <div class='fill-height pa-3'>
    <v-scroll-x-reverse-transition mode='out-in'>
      <div v-if='!connected' key='connect' class='fill-height d-flex justify-center align-center'>
        <v-btn :loading='connecting' color='accent' x-large @click='connect'>
          <v-icon left>mdi-twitch</v-icon>
          Connect to Twitch
        </v-btn>
      </div>
      <div v-else key='app'>
        <v-row>
          <v-col cols='6'>
            <h2 class='text-center'>Chat</h2>
            <chat-control-message-view
              v-for='(message, index) of messages'
              :key='index'
              :message='message'
            />
          </v-col>
          <v-col cols='6'>
            <div class='d-flex justify-end mb-2'>
              <v-btn text @click='disconnect'>
                Disconnect
              </v-btn>
            </div>
            <chat-control-commands-editor
              v-model='commands'
              :active-commands='activeCommands'
              @export='exportCommands'
              @import='importCommands'
            />
          </v-col>
        </v-row>
      </div>
    </v-scroll-x-reverse-transition>
  </div>
</template>

<script>
  import { v4 as uuidv4 } from 'uuid'

  const COMMANDS_STORAGE_KEY = 'chatControl.commands'

  export default {
    name: 'ChatControl',
    layout: 'plain',
    data: () => ({
      connected: false,
      connecting: true,
      messages: [],
      commands: [],
      activeCommands: [],
    }),
    head: {
      title: 'Chat Control',
    },
    watch: {
      commands: {
        deep: true,
        handler(value) {
          window.localStorage.setItem(COMMANDS_STORAGE_KEY, JSON.stringify(value.filter(v => !!v)))
        },
      }
    },
    async mounted() {
      const savedCommands = window.localStorage.getItem(COMMANDS_STORAGE_KEY)
      if (savedCommands) {
        try {
          this.commands = JSON.parse(savedCommands)?.filter(v => !!v)
        } catch (e) {
          console.error(e)
        }
      }

      window.electronApi.on('chatControl.setConnected', (event, connected) => {
        this.connecting = false
        this.connected = connected
      })

      window.electronApi.on('chatControl.onRedemption', async (event, message) => {
        const chatMessage = {
          ...message,
          type: 'reward',
          commandIds: [],
        }
        this.messages.push(chatMessage)

        for (const command of this.commands) {
          if (command.triggers.some(t => t.type === 'reward' && t.rewardId === message.reward.id)) {
            chatMessage.commandIds.push(command.id)
            await this.runCommand(command, message.message?.trim().split(' ') ?? [])
          }
        }
      })

      window.electronApi.on('chatControl.onMessage', async (event, { user, message }) => {
        const chatMessage = {
          type: 'message',
          user,
          text: message,
          commandIds: [],
        }
        this.messages.push(chatMessage)

        const messageRegex = /!(?<action>[^ ]+)(?<params>.*)/
        if (messageRegex.test(message)) {
          const matches = messageRegex.exec(message)

          for (const command of this.commands) {
            if (command.triggers.some(t => t.type === 'command' && t.action.toLowerCase() === matches.groups.action.toLowerCase())) {
              chatMessage.commandIds.push(command.id)
              await this.runCommand(command, matches.groups.params.trim().split(' '))
            }
          }
        }
      })

      this.connected = await window.electronApi.invoke('chatControl.isConnected')
      this.connecting = false
    },
    methods: {
      async connect() {
        this.connecting = true
        this.connected = false
        await window.electronApi.invoke('chatControl.connectTwitchAccount')
      },
      async disconnect() {
        await window.electronApi.invoke('chatControl.disconnectTwitchAccount')
        this.connected = false
      },
      async runCommand(command, params) {
        if (command && !this.activeCommands.includes(command.id)) {
          this.activeCommands.push(command.id)
          await window.electronApi.invoke('chatControl.runScript', {
            script: command.script,
            params,
          })
          this.activeCommands.splice(this.activeCommands.indexOf(command.id), 1)
        }
      },
      async exportCommands() {
        const json = JSON.stringify(
          this.commands.map(c => {
            delete c.id
            return c
          })
        )

        await window.electronApi.invoke('chatControl.exportCommands', {
          json,
        })
      },
      async importCommands() {
        const json = await window.electronApi.invoke('chatControl.importCommands')

        if (json) {
          try {
            const rawCommands = JSON.parse(json)

            rawCommands.sort((a, b) => a.name.localeCompare(b.name))

            for (const rawCommand of rawCommands) {
              this.commands.push({
                ...rawCommand,
                id: uuidv4(),
              })
            }
          } catch (e) {
            console.error(e)
          }
        }
      },
    },
  }
</script>

<style lang='scss' scoped>

</style>
