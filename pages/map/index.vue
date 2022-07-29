<template>
  <div class="d-flex flex-grow-1">
    <wotw-map class="flex-grow-1 flex-shrink-1" :render-fn="renderFn" />
  </div>
</template>

<script>
  // import * as PIXI from 'pixi.js'
  import spawns from '@/assets/map-overlays/spawns'

  const OVERLAYS = {
    spawns,
  }

  export default {
    layout: 'default-without-footer',
    data: () => ({
      enabledOverlays: ['spawns'],
    }),
    methods: {
      /**
       * @param app {PIXI.Application}
       * @param container {PIXI.Container}
       */
      async renderFn(app, container) {
        for (const overlayName of this.enabledOverlays) {
          await OVERLAYS[overlayName](app, container)
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .full-height {
    flex-grow: 1;
    flex-shrink: 1;
  }
</style>
