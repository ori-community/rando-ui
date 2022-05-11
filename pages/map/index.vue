<template>
  <div class="d-flex flex-grow-1">
    <wotw-map :render-fn="renderFn" class="flex-grow-1 flex-shrink-1" />
  </div>
</template>

<script>
  import * as PIXI from 'pixi.js'

  export default {
    layout: 'default-without-footer',
    methods: {
      /**
       * @param app {PIXI.Application}
       * @param viewport {Viewport}
       */
      renderFn(app, viewport) {
        const graphics = new PIXI.Graphics()
        graphics
          .lineStyle({
            width: 2,
            color: 0x00BB66,
          })
          .moveTo(-958, 4313)
          .lineTo(2054, 4050)
        viewport.addChild(graphics)
      },
    },
  }
</script>

<style lang="scss" scoped>
  .full-height {
    flex-grow: 1;
    flex-shrink: 1;
  }
</style>
