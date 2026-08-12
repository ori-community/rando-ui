<template>
  <v-card class="d-inline-block" color="background-lighten-1">
    <v-btn
      ref="buttonRef"
      color="accent"
      size="x-large"
      block
      :disabled="disabled"
      :loading="isLaunching"
      @click="onClick"
    >
      <slot name="icon">
        <img
          v-if="!displayedIcon"
          class="launch-icon"
          :class="{ disabled: disabled }"
          src="@shared/images/launch.png"
          alt=""
        >
        <v-icon v-else start>{{ displayedIcon }}</v-icon>
      </slot>
      {{ displayedLabel }}
      <slot />
    </v-btn>
    <div v-if="subtitle !== null" class="pa-2 text-center text-body-medium opacity-70 subtitle">{{ subtitle }}</div>
  </v-card>
</template>

<script lang="ts" setup>
  import {confettiFromElement} from "~/assets/utils/confetti"

  const emit = defineEmits<{
    (e: "click", event: MouseEvent): void
  }>()

  const props = withDefaults(defineProps<{
    label?: string | null,
    disabled?: boolean,
    icon?: string | null,
    showConfetti?: boolean,
    subtitle?: string | null,
  }>(), {
    label: null,
    disabled: false,
    icon: null,
    showConfetti: false,
    subtitle: null,
  })

  const isLeek = ref(false) // funny (display lauch / leek)
  const confettiScheduledForNextSuccessfulLaunch = ref(false)
  const buttonRef = ref<{ $el: HTMLElement } | null>(null)
  const {isLaunching, onLaunchResult} = useLauncherHelper()
  const displayedIcon = computed(() => {
    if (props.icon) {
      return props.icon
    }
    if (isLeek.value) {
      return "mdi-leek"
    }
    return null
  })

  const displayedLabel = computed(() => {
    if (props.label) {
      return props.label
    }
    return isLeek.value ? "Lauch" : "Launch"
  })

  const onClick = (async (event: MouseEvent) => {
    confettiScheduledForNextSuccessfulLaunch.value = true
    emit("click", event)
  })

  onLaunchResult.on((launchResult) => {
    if (props.showConfetti && launchResult.launchedSuccessfully && confettiScheduledForNextSuccessfulLaunch.value) {
      shootConfetti()
    }
  })

  const shootConfetti = (() => {
    if (!buttonRef.value) {
      return
    }

    confettiFromElement(buttonRef.value.$el, {disableForReducedMotion: true})
  })

  onMounted(() => {
    const today = new Date()
    isLeek.value = Math.random() < 0.005 || (today.getDate() === 1 && today.getMonth() === 3)
  })
</script>

<style lang="scss" scoped>
  .launch-icon {
    height: 2.25em;
    width: auto;
    margin-right: 0.5em;
    margin-left: -0.5em;

    &.disabled {
      opacity: 0.4;
      filter: grayscale(1);
    }
  }

  .subtitle {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
</style>
