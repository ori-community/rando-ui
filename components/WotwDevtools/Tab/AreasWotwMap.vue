<template>
  <div class="d-flex flex-grow-1 relative">
    <v-slide-y-transition>
      <v-card v-if="selection !== null" class="selection-info pa-3">
        <template v-if="selectionType === 'connection'">
          <h3>Connection</h3>
          <div>{{ selection.start }}</div>
          <div class="text-center">
            <v-icon v-if="selection.unidirectional">mdi-arrow-down</v-icon>
            <v-icon v-else>mdi-arrow-up-down</v-icon>
          </div>
          <div>{{ selection.end }}</div>
        </template>
        <template v-else-if="selectionType === 'node'">
          <h3>Node</h3>
          <div>{{ selection.name }}</div>
          <div>Position: {{ selection.position.x }}, {{ selection.position.y }}</div>
        </template>
        <template v-else-if="selectionType === 'error'">
          <h3>Error</h3>
          <pre>{{ selection.message }}</pre>
        </template>
      </v-card>
    </v-slide-y-transition>
    <wotw-map ref="map" :render-fn="renderFn" class="flex-grow-1" />
  </div>
</template>

<script>
  import * as PIXI from 'pixi.js'
  import WebworkerPromise from 'webworker-promise/lib'
  import {Matrix3, Vector2} from '@math.gl/core'
  import {DashLine} from 'pixi-dashed-line'
  import AreasWotwGraphWorker from '~/assets/lib/workers/areasWotwGraph.worker.js'
  import {flipY} from '~/assets/lib/flipY'

  export default {
    name: 'AreasWotwMap',
    data: () => ({
      selection: null,
      selectionType: null,
      renderingOverlay: false,
      shouldRenderOverlayAgainAfterRenderingCompleted: false,
    }),
    mounted() {
      window.electronApi.invoke('seedgen.startWatchingSourceFiles')
      window.electronApi.on('seedgen.sourceFilesUpdated', async () => {
        console.log('Seedgen source files updated!')

        if (!this.renderingOverlay) {
          await this.$refs.map.renderOverlay()
        } else {
          this.shouldRenderOverlayAgainAfterRenderingCompleted = true
        }
      })
    },
    beforeDestroy() {
      window.electronApi.invoke('seedgen.stopWatchingSourceFiles')
    },
    methods: {
      /**
       * @param app {PIXI.Application}
       * @param container {PIXI.Container}
       */
      async renderFn(app, container) {
        this.renderingOverlay = true

        try {
          const areasWotwContents = await window.electronApi.invoke('seedgen.getAreasFileContents')
          const locDataFileContents = await window.electronApi.invoke('seedgen.getLocDataFileContents')

          const worker = new WebworkerPromise(new AreasWotwGraphWorker())
          const graph = await worker.postMessage({
            areasWotwContents,
            locDataFileContents
          })

          container.removeChildren()

          for (const connection of graph.connections) {
            const startNode = graph.nodes[connection.start]
            const endNode = graph.nodes[connection.end]

            const startVector = new Vector2().fromObject(startNode.position)
            const endVector = new Vector2().fromObject(endNode.position)
            flipY(startVector, endVector)

            const deltaVector = endVector.clone().subtract(startVector)
            const offsetVector = deltaVector
              .clone()
              .normalize()
              .transformByMatrix3(
                new Matrix3()
                  .rotate(Math.PI * 0.5)
              )
              .multiplyScalar(2)

            const line = new PIXI.Graphics()
            line.interactive = true
            line.hitArea = new PIXI.Polygon([
              startVector.clone().add(offsetVector),
              startVector.clone().subtract(offsetVector),
              endVector.clone().subtract(offsetVector),
              endVector.clone().add(offsetVector),
            ])

            const {ConnectionType} = await import('@ori-rando/wotw-seedgen-wasm-ui')

            const redrawLine = (width = 1.0) => {
              line.clear()

              const dashLine = new DashLine(line, {
                width,
                color: connection.type === ConnectionType.Branch
                  ? 0x00BB66
                  : 0x44AAFF,
                dash: connection.unidirectional
                  ? [2, 1]
                  : [1, 0],
              })

              dashLine
                .moveTo(startVector.x, startVector.y)
                .lineTo(endVector.x, endVector.y)

              if (connection.unidirectional) {
                const halfDeltaVector = deltaVector.clone().scale(0.5)
                const arrowStartVector = startVector.clone().add(halfDeltaVector)
                const arrowEndVector1 = arrowStartVector
                  .clone()
                  .add(
                    new Vector2(5 * Math.sqrt(width), 0)
                      .transformByMatrix3(
                        new Matrix3().rotate(-deltaVector.verticalAngle() + Math.PI * 1.7)
                      )
                  )
                const arrowEndVector2 = arrowStartVector
                  .clone()
                  .add(
                    new Vector2(5 * Math.sqrt(width), 0)
                      .transformByMatrix3(
                        new Matrix3().rotate(-deltaVector.verticalAngle() + Math.PI * 1.3)
                      )
                  )

                line
                  .lineStyle({
                    width,
                    color: connection.type === ConnectionType.Branch
                      ? 0x00BB66
                      : 0x44AAFF,
                    cap: PIXI.LINE_CAP.ROUND,
                  })
                  .moveTo(arrowEndVector1.x, arrowEndVector1.y)
                  .lineTo(arrowStartVector.x, arrowStartVector.y)
                  .lineTo(arrowEndVector2.x, arrowEndVector2.y)
              }
            }

            line.on('click', () => {
              console.log(connection)
            })

            line.on('mouseover', () => {
              redrawLine(3.0)
              this.selectionType = 'connection'
              this.selection = connection
            })

            line.on('mouseout', () => {
              redrawLine(1.0)
              this.selection = null
            })

            redrawLine()

            container.addChild(line)
          }

          for (const node of Object.values(graph.nodes)) {
            const circle = new PIXI.Graphics()
            const positionVector = new Vector2().fromObject(node.position)
            flipY(positionVector)

            circle.interactive = true
            circle.hitArea = new PIXI.Circle(positionVector.x, positionVector.y, 4)

            const redrawCircle = (radius = 1.5) => {
              circle
                .clear()
                .beginFill(0xFFFFFF, 1.0)
                .drawCircle(positionVector.x, positionVector.y, radius)
            }

            circle.on('click', () => {
              console.log(node)
            })

            circle.on('mouseover', () => {
              redrawCircle(3.0)
              this.selectionType = 'node'
              this.selection = node
            })

            circle.on('mouseout', () => {
              redrawCircle()
              this.selection = null
            })

            redrawCircle()
            container.addChild(circle)
          }

          if (this.selectionType === 'error') {
            this.selection = null
          }
        } catch (e) {
          console.error(e)
          this.selection = e
          this.selectionType = 'error'
        }

        this.renderingOverlay = false
        if (this.shouldRenderOverlayAgainAfterRenderingCompleted) {
          await this.$refs.map.renderOverlay()
        }
      },
    },
  }
</script>

<style lang="scss" scoped>
  .relative {
    position: relative;
  }

  .selection-info {
    position: absolute;
    top: 1em;
    right: 1em;
    z-index: 10;
  }
</style>