<template>
  <span class="timer">
    {{ mainTimerText }}<span class="fraction">{{ fractionTimerText }}</span>
  </span>
</template>

<script lang="ts" setup>

  import {formatTime} from "assets/utils/formatTime"

  const props = withDefaults(defineProps<{
    startingAt: number,
    finishedTime?: number | null
  }>(), {
    finishedTime: null,
  })

  const mainTimerText = ref('0')
  const fractionTimerText = ref('.0')
  const updateIntervalId = ref<NodeJS.Timeout | null>(null)

  onMounted(() => {
    updateIntervalId.value = setInterval(() => updateTimerText(), 100)
    updateTimerText()
  })
  onUnmounted(() => {
    if (updateIntervalId.value !== null) {
      clearInterval(updateIntervalId.value)
    }
  })


  const updateTimerText = (() => {

    // TODO + Server offset
    // const parts = formatTime(props.finishedTime !== null ? props.finishedTime : (Date.now() + this.offset - props.startingAt) / 1000).split(
    const parts = formatTime(props.finishedTime !== null ? props.finishedTime : (Date.now() - props.startingAt) / 1000).split(
      '.',
      2,
    )
    mainTimerText.value = parts[0]
    fractionTimerText.value = '.' + parts[1]
  })
</script>

<style lang="scss" scoped>
  .timer {
    font-size: 3em;
    font-weight: 700;

    .fraction {
      font-size: 0.75em;
      font-weight: 100;
    }
  }
</style>
