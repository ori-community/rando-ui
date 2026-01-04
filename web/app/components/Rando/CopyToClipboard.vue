<template>
  <div class="wrapper">
    <slot :copy-to-clipboard="copyToClipboard" :is-triggered="isTriggered"/>
    <v-tooltip
      :model-value="showTooltip && isTriggered"
      activator="parent"
      :location="tooltipLocation"
      :transition="tooltipTransition"
      :open-on-hover="false"
      :open-on-click="false"
      :open-on-focus="false"
    >
      <span>{{ tooltipText }}</span>
    </v-tooltip>
  </div>
</template>

<script lang="ts" setup>
  import type {Anchor} from "vuetify/lib/util";

  const props = withDefaults(defineProps<{
      value: string,
      timeout?: number,
      showTooltip?: boolean,
      tooltipText?: string,
      tooltipLocation?: Anchor,
      tooltipTransition?: string,
    }>(), {
      timeout: 1500,
      showTooltip: false,
      tooltipText: 'Copied!',
      tooltipLocation: 'right',
      tooltipTransition: 'slide-x-transition',
    }
  )

  const isTriggered = ref(false)

  const copyToClipboard = (async () => {
    try {
      await navigator.clipboard.writeText(props.value)
    } catch (e) {
      console.error('Clipboard failed', e)
      return
    }

    isTriggered.value = true
    setTimeout(() => {
      isTriggered.value = false
    }, props.timeout)
  })

</script>

<style lang="scss" scoped>
  .wrapper {
    display: inline-flex;
    position: relative;
  }
</style>
