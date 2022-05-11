<template>
  <div ref="container" class="relative">
    <v-snackbar :value="loading" transition="scroll-y-transition" bottom left>
      Loading map: {{ Math.round(loadingProgressValue / loadingProgressMax * 100.0) }}%...
    </v-snackbar>
    <canvas ref="canvas" class="fill-canvas"/>
  </div>
</template>

<script>
  import * as PIXI from 'pixi.js'
  import {Viewport} from 'pixi-viewport'

  export default {
    name: 'WotwMap',
    props: {
      renderFn: {
        type: Function,
        default: null,
      }
    },
    data: () => ({
      loading: true,
      loadingProgressValue: 0,
      loadingProgressMax: 1,
    }),
    async mounted() {
      const app = new PIXI.Application({
        view: this.$refs.canvas,
        backgroundColor: 0x000000,
        resizeTo: this.$refs.container,
        antialias: false,
      })

      const viewport = new Viewport({
        interaction: app.renderer.plugins.interaction // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
      })

      new ResizeObserver(() => {
        viewport.resize()
      }).observe(this.$refs.canvas)

      app.stage.addChild(viewport)

      console.log('Loading map...')

      const TILES_X = 35
      const TILES_Y = 8
      const TILE_SIZE = 512

      // Calculated with S C I E N C E
      const TILE_SCALE = 3023.460435 / 12359.664154
      const MAP_OFFSET_X = -2015.2614140037902
      const MAP_OFFSET_Y = 3513.5714250429464

      viewport
        .clampZoom({
          minScale: 0.6,
          maxScale: 8.0,
        })
        .drag()
        .pinch()
        .wheel()
        .decelerate({
          friction: 0.9,
        })
        .clamp({
          left: TILES_X * TILE_SIZE * TILE_SCALE * -0.5 + MAP_OFFSET_X,
          top: TILES_Y * TILE_SIZE * TILE_SCALE * -1.0 + MAP_OFFSET_Y,
          right: TILES_X * TILE_SIZE * TILE_SCALE * 1.5 + MAP_OFFSET_X,
          bottom: TILES_Y * TILE_SIZE * TILE_SCALE * 2.0 + MAP_OFFSET_Y,
          // direction: 'all',
          underflow: 'none',
        })

        // Zoom to Marsh
        .setZoom(2.0)
        .moveCenter(-800, 4340)


      const promises = []
      for (let x = 0; x <= 35; x++) {
        for (let y = 0; y <= 8; y++) {
          promises.push((async () => {
            const tileResource = await import((`@/assets/images/map/tile-${x}_${y}.png`))

            this.loadingProgressMax++

            app.loader.add(`tile-${x}_${y}`, tileResource.default, (resource) => {
              resource.texture.mipmap = PIXI.MIPMAP_MODES.ON
              const tileSprite = new PIXI.Sprite(resource.texture)
              tileSprite.x = 512 * x * TILE_SCALE + MAP_OFFSET_X
              tileSprite.y = 512 * y * TILE_SCALE + MAP_OFFSET_Y
              tileSprite.scale.x = TILE_SCALE
              tileSprite.scale.y = TILE_SCALE
              viewport.addChild(tileSprite)

              this.loadingProgressValue++
            })
          })())
        }
      }

      await Promise.allSettled(promises)
      app.loader.load(() => {
        console.log('Map loaded. Calling renderFn...')
        if (this.renderFn) {
          this.renderFn(app, viewport)
        }

        this.loading = false
      })
    }
  }
</script>

<style lang="scss" scoped>
  .relative {
    position: relative;
  }

  .fill-canvas {
    min-height: 0;
    display: block;
  }
</style>
