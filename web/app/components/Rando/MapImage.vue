<template>
  <k-image
    :x="x"
    :y="y"
    :scaleY="flipY ? -1 : 1"
    :width="width"
    :height="width * ratio"
    :offsetX="width / 2"
    :offsetY="(width * ratio) / 2"
    :image="image"
    :opacity="1"
  />
</template>

<script lang="ts" setup>
  import {Image as KImage} from "vue-konva"

  withDefaults(defineProps<{
    x: number,
    y: number,
    width: number,
    ratio: number,
    image?: HTMLImageElement | null,
    opacity?: number
    flipY?: boolean
  }>(), {
    image: null,
    opacity: 1,
    flipY: false,
  })

</script>

<style lang="scss" scoped>

</style>
