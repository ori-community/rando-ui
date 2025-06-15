<template>
  <v-container>
    Hi bitte Injector.exe doppelklick und so warnungen ignorieren have fun!

    <v-btn @click="test1">Click</v-btn>

    {{ time }}
  </v-container>
</template>

<script lang="ts" setup>
  const electronApi = useElectronApi()
  const time = ref(0)

  async function test1() {
    await electronApi.auth.startOAuthFlow.query({
      apiBaseUrl: 'https://wotw.orirando.com',
      forceWindowLogin: false,
    })
  }

  onMounted(() => {
    electronApi.timer.onTick.subscribe(undefined, {
      onData(value: number) {
        console.log("Timer:", value)
        time.value = value
      },
    })
  })
</script>

<style lang="scss" scoped>

</style>
