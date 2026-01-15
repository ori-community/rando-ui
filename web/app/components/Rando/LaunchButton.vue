<template>
  <v-btn
    ref="buttonRef"
    color="accent"
    size="x-large"
    :disabled="disabled"
    :loading="isLaunching && hasBeenClicked"
    @click="onClick">
    <img
      v-if="!displayedIcon"
      class="launch-icon"
      :class="{ disabled: disabled }"
      src="@shared/images/launch.png"
      alt=""
    >
    <v-icon v-else start>{{ displayedIcon }}</v-icon>
    {{ displayedLabel }}
  </v-btn>
</template>

<script lang="ts" setup>

  import {confettiFromElement} from "~/assets/utils/confetti";

  const emit = defineEmits<{
    (e: 'click', event: MouseEvent): void
  }>()

  const props = withDefaults(defineProps<{
    label?: string | null,
    disabled?: boolean,
    icon?: string | null,
    showConfetti?: boolean,
  }>(), {
    label: null,
    disabled: false,
    icon: null,
    showConfetti: false,
  })

  const isLeek = ref(false) // funny (display lauch / leek)
  const hasBeenClicked = ref(false)
  const buttonRef = ref<{ $el: HTMLElement } | null>(null)
  const {isLaunching} = useLauncherHelper()
  const displayedIcon = computed(() => {
    if (props.icon) {
      return props.icon
    }
    if (isLeek.value) {
      return 'mdi-leek'
    }
    return null
  })
  const displayedLabel = computed(() => {
    if (props.label) {
      return props.label
    }
    return isLeek.value ? "lauch" : "launch"
  })
  const onClick = (async (event: MouseEvent) => {
    hasBeenClicked.value = true
    emit('click', event)
  })

  watch(
    () => isLaunching.value, (newValue, oldValue) => {
      console.log("isLaunching changed", newValue)
      if (oldValue && !newValue && hasBeenClicked.value) {
        hasBeenClicked.value = false
        if (props.showConfetti) {
          shootConfetti()
        }
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
</style>
