<template>
  <div class="place-badge">
    <v-icon :size="size" :color="color">{{ icon }}</v-icon>
    <div
      class="text-container"
      :style="{
        fontSize: `${calcFontSize}px`, // Set font size using the prop value
        fontWeight: calcFontWeight,
      }"
    >
      {{ place }}
    </div>
  </div>
</template>

<script language="ts" setup>
  const props = defineProps({
    place: {
      type: [Number, null],
      default: 1,
    },
    size: {
      type: Number,
      default: 64,
    },
  })
  const icon = computed(() => {
    switch (Number(props.place)) {
      case 1:
      case 2:
      case 3:
        return 'mdi-decagram'
      default:
        return 'mdi-circle'
    }
  })
  const color = computed(() => {
    switch (Number(props.place)) {
      case 1:
        return '#ffd200'
      case 2:
        return '#909090'
      case 3:
        return '#864b30'
      default:
        return 'background-lighten-2'
    }
  })
  const calcFontSize = computed(() => {
    return props.size * 0.4
  })
  const calcFontWeight = computed(() => {
    return props.size * 14
  })

</script>

<style lang="scss" scoped>
  .place-badge {
    position: relative;
    display: inline-block;

    .text-container {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
</style>
