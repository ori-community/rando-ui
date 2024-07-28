<template>
  <v-container>
    Hi bitte Injector.exe doppelklick und so warnungen ignorieren have fun!

    <v-btn @click="test1">Click</v-btn>

    {{ time }}
  </v-container>
</template>

<script lang="ts" setup>
  import { createTRPCProxyClient } from '@trpc/client'
  import type { LauncherApiRouter } from '@ori-rando/launcher/src/api/api'
  import { ipcLink } from 'electron-trpc/renderer'

  const client = createTRPCProxyClient<LauncherApiRouter>({
    links: [ipcLink()]
  })

  const time = ref(0)

  async function test1() {
    await client.auth.startOAuthFlow.query({
      baseUrl: 'https://wotw.orirando.com',
      forceWindowLogin: false,
    })
  }

  onMounted(() => {
    client.timer.onTick.subscribe(undefined, {
      onData(value: number) {
        time.value = value
      },
    })
  })
</script>

<style lang="scss" scoped>

</style>
