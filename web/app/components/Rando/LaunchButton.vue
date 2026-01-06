<template>
  <v-btn color="accent" size="x-large" :disabled="disabled" :loading="isLaunching" @click="onClick">
    <img
      v-if="!displayedIcon"
      class="launch-icon"
      :class="{ disabled: disabled }"
      src="@shared/images/launch.png"
      alt=""
    >
    <v-icon v-else start>{{ displayedIcon }}</v-icon>
    <slot>{{ isLeek ? "lauch" : "launch" }}</slot>
  </v-btn>
</template>

<script lang="ts" setup>

  const emit = defineEmits<{
    (e: 'click', event: Event): void
  }>()

  const props = withDefaults(defineProps<{
    disabled?: boolean,
    icon?: string | null,
    showConfetti?: boolean,
  }>(), {
    disabled: false,
    icon: null,
    showConfetti: false,
  })

  const isLeek = ref(false) // funny (display lauch / leek)
  const hasBeenClicked = ref(false)

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
  const onClick = (async (event: Event) => {
    hasBeenClicked.value = true
    emit('click', event)
  })

  watch(
    () => isLaunching.value, (newValue, oldValue) => {
      if (oldValue && !newValue && hasBeenClicked.value) {
        hasBeenClicked.value = false
        if (props.showConfetti) {
          shootConfetti()
        }
      }
    })

  const shootConfetti = (() => {
    // TODO confetti
    console.log("Insert confetti here")
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
