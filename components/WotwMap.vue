<template>
  <div ref="container" class="relative">
    <v-snackbar :value="loading" transition="scroll-y-transition" bottom left>
      <template v-if="!!customLoadingText">
        {{ customLoadingText }}
      </template>
      <template v-else>
        Loading map: {{ Math.round((loadingProgressValue / loadingProgressMax) * 100.0) }}%...
      </template>
    </v-snackbar>
    <div ref="timelineStageContainer" class="stage-container fill-height">
      <k-stage
        ref="stage"
        :config="stageConfig"
        @wheel="onStageWheel"
        @mouseMove="(e) => emitMousePosition('mousemove', e)"
        @click="(e) => emitMousePosition('click', e)"
      >
        <k-layer ref="layer">
          <k-image v-for="(tile, index) in mapTiles" :key="index" :config="tile" />
        </k-layer>
        <slot />
      </k-stage>
    </div>
  </div>
</template>

<script>
  import Konva from 'konva'

  export default {
    name: 'WotwMap',
    props: {
      renderFn: {
        type: Function,
        default: null,
      },
    },
    data: () => ({
      stageConfig: {
        width: 1,
        height: 1,
        x: 1000,
        y: -2880,
        scale: {
          x: 0.75,
          y: -0.75,
        },
        draggable: true,
      },
      mapTiles: [],
      loading: false,
      loadingProgressValue: 0,
      loadingProgressMax: 1,
      customLoadingText: null,
      isDestroyed: false,
    }),
    computed: {
      constants: () => ({
        tilesX: 36,
        tilesY: 9,
        tileSize: 512,
        // Calculated with S C I E N C E
        tileScale: 3023.460435 / 12359.664154,
        mapOffsetX: -2015.2614140037902,
        mapOffsetY: -3513.5714250429464,
      }),
      stage() {
        return this.$refs.stage.getStage()
      },
      mapArea() {
        const width = this.constants.tileSize * this.constants.tilesX * this.constants.tileScale
        const height = -this.constants.tileSize * this.constants.tilesY * this.constants.tileScale
        return {
          x: this.constants.mapOffsetX,
          y: this.constants.mapOffsetY,
          width,
          height,
          centerX: this.constants.mapOffsetX + width / 2,
          centerY: this.constants.mapOffsetY + height / 2,
        }
      },
    },
    mounted() {
      const observer = new ResizeObserver(() => this.updateStageSize())
      observer.observe(this.$refs.timelineStageContainer)

      for (let x = 0; x < this.constants.tilesX; x++) {
        for (let y = 0; y < this.constants.tilesY; y++) {
          this.loadImage(x, y)
        }
      }
    },
    beforeDestroy() {
      this.isDestroyed = true
    },
    methods: {
      emitMousePosition(eventName, event) {
        const layer = this.stage.children[0]
        this.$emit(eventName, event, layer.getRelativePointerPosition())
      },
      async loadImage(x, y) {
        try {
          const image = await this.getImage(x, y)
          this.mapTiles.push({
            image,
            x: 512 * this.constants.tileScale * x + this.constants.mapOffsetX,
            y: -512 * this.constants.tileScale * y + this.constants.mapOffsetY,
            scale: {
              x: this.constants.tileScale,
              y: -this.constants.tileScale,
            },
          })
        } catch (e) {}
      },
      async getImage(x, y) {
        const image = new Image()
        image.src = (await import(`@/assets/images/map/tile-${x}_${y}.png`)).default
        return await new Promise((resolve) => {
          image.onload = () => {
            resolve(image)
          }
        })
      },
      updateStageSize() {
        if (!this.$refs.timelineStageContainer) {
          return
        }

        this.stageConfig.width = this.$refs.timelineStageContainer.clientWidth
        this.stageConfig.height = this.$refs.timelineStageContainer.clientHeight
      },
      onStageWheel(e) {
        const scaleBy = 0.96
        const stage = this.stage
        const oldScale = stage.scaleX()
        const pointer = stage.getPointerPosition()

        const mousePointTo = {
          x: (pointer.x - stage.x()) / oldScale,
          y: (pointer.y - stage.y()) / oldScale,
        }

        // how to scale? Zoom in? Or zoom out?
        let direction = e.evt.deltaY > 0 ? 1 : -1

        // when we zoom on trackpad, e.evt.ctrlKey is true
        // in that case lets revert direction
        if (e.evt.ctrlKey) {
          direction = -direction
        }

        const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy

        stage.scale({ x: newScale, y: -newScale })

        const newPos = {
          x: pointer.x - mousePointTo.x * newScale,
          y: pointer.y - mousePointTo.y * newScale,
        }

        stage.position(newPos)
      },
      centerOn(targetX, targetY, targetScale = null) {
        const stage = this.stage

        const { width, height } = stage.size()

        const newScale = targetScale ?? stage.scaleX()
        const scaledTargetX = targetX * newScale
        const scaledTargetY = targetY * -newScale

        const newX = -scaledTargetX + width / 2
        const newY = -scaledTargetY + height / 2

        stage.to({
          x: newX,
          y: newY,
          scaleX: newScale,
          scaleY: -newScale,
          duration: 0.7,
          easing: Konva.Easings.EaseOut,
        })
      },
      zoomOn(points) {
        if (points.length === 0) {
          return
        }
        if (points.length === 1) {
          this.centerOn(points[0].x, points[0].y)
          return
        }

        const stage = this.stage
        let minX = Infinity
        let minY = Infinity
        let maxX = -Infinity
        let maxY = -Infinity

        for (const point of points) {
          if (point.x < minX) {
            minX = point.x
          }
          if (point.y < minY) {
            minY = point.y
          }
          if (point.x > maxX) {
            maxX = point.x
          }
          if (point.y > maxY) {
            maxY = point.y
          }
        }

        const newWidth = maxX - minX
        const newHeight = maxY - minY

        if (newWidth === 0 || newHeight === 0) {
          this.centerOn(points[0].x, points[0].y)
          return
        }

        const centerX = minX + newWidth / 2
        const centerY = minY + newHeight / 2

        const { width, height } = stage.size()

        const scaleX = width / newWidth
        const scaleY = height / newHeight
        const minScale = Math.min(scaleX, scaleY) * 0.98

        this.centerOn(centerX, centerY, minScale)
      },
      zoomToFit() {
        this.zoomOn([
          { x: this.constants.mapOffsetX, y: this.constants.mapOffsetY },
          { x: this.constants.mapOffsetX + this.mapArea.width, y: this.constants.mapOffsetY + this.mapArea.height },
        ])
      },
    },
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
