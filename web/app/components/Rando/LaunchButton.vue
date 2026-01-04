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
    <v-tooltip v-if="hint" location="bottom" activator="parent">
      <span>{{ hint }}</span>
    </v-tooltip>
  </v-btn>
</template>

<script lang="ts" setup>

  import type {LaunchResult} from "@shared/types/launcher";

  const props = withDefaults(defineProps<{
    disabled?: boolean,
    icon?: string | null,
    hint?: string | null,
    handle?: (() => Promise<void>) | (() => Promise<LaunchResult>) | null,
  }>(), {
    disabled: false,
    icon: null,
    hint: null,
    handle: null,
  })

  const isLeek = ref(false) // funny (display lauch / leek)

  const {isLaunching, launch} = useLauncherHelper()
  const displayedIcon = computed(() => {
    if (props.icon) {
      return props.icon
    }
    if (isLeek.value) {
      return 'mdi-leek'
    }
    return null
  })
  const onClick = ((_event: MouseEvent) => {
    if (props.handle) {
      props.handle()
    } else {
      launch()
    }
    // TODO optional confetti
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
