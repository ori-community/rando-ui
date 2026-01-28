<template>
  <div class="relative">
    <div ref="containerRef" class="konva-container fill-height">
      <k-stage
        ref="stageRef"
        :config="stageConfig"
        @wheel="onStageWheel"
        @mouse-move="(e: MouseEvent) => emitMousePosition(e, 'mousemove')"
        @click="(e: MouseEvent) => emitMousePosition(e, 'mouseclick')"
      >
        <k-layer
          ref="layerRef"
          :config="layerConfig"
          :draggable="true"
          @dragmove="emitTransformchange()"
        >
          <k-group
            ref="groupRef"
            :config="groupConfig"
          >
            <!-- invisible rect for dragging -->
            <k-rect :x="-5000" :y="-8000" :width="11000" :height="8000"/>

            <k-image
              v-for="(tile, index) in mapTiles"
              :key="index"
              :config="tile"
            />
            <slot/>
          </k-group>
        </k-layer>
        <div>
          <slot name="overlay"/>
        </div>
      </k-stage>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import {ref, onMounted} from 'vue'
  import Konva from "konva"
  import {Stage as KStage, Group as KGroup, Layer as KLayer, Image as KImage, Rect as KRect} from "vue-konva"
  import {type NodeTransform, GetMapTransform} from "~/assets/utils/mapHelper"

  const stageRef = ref<{ getNode: () => Konva.Stage } | null>(null)
  const layerRef = ref<{ getNode: () => Konva.Layer } | null>(null)
  const groupRef = ref<{ getNode: () => Konva.Group } | null>(null)
  const imageNode = ref(null)

  const containerRef = ref<HTMLElement | null>(null)
  const mapTiles = ref<Konva.ImageConfig[]>([])
  const emit = defineEmits<{
    (e: 'mouseclick' | 'mousemove', event: MouseEvent, point: Konva.Vector2d): void,
    (e: 'transformChanged', transform: NodeTransform): void,
  }>()

  withDefaults(defineProps<{
    draggable?: boolean,
  }>(), {draggable: true})

  const stageConfig = ref({width: 0, height: 0})
  const layerConfig = ref({x: 1000, y: -2880, scale: {x: 0.75, y: -0.75}})
  const groupConfig = ref({x: 0, y: 0})

  const constants = computed(() => ({
    tilesX: 36,
    tilesY: 9,
    tileSize: 512,
    // Calculated with S C I E N C E
    tileScale: 3023.460435 / 12359.664154,
    mapOffsetX: -2015.2614140037902,
    mapOffsetY: -3513.5714250429464,
  }))

  const mapArea = computed(() => {
    const width = constants.value.tileSize * constants.value.tilesX * constants.value.tileScale
    const height = -constants.value.tileSize * constants.value.tilesY * constants.value.tileScale
    return {
      x: constants.value.mapOffsetX,
      y: constants.value.mapOffsetY,
      width,
      height,
      centerX: constants.value.mapOffsetX + width / 2,
      centerY: constants.value.mapOffsetY + height / 2,
    }
  })

  const images = import.meta.glob('@shared/images/map/tiles/tile-*.png', {eager: true})
  onMounted(() => {
    updateStageSize()
    window.addEventListener('resize', updateStageSize)

    for (let x = 0; x < constants.value.tilesX; x++) {
      for (let y = 0; y < constants.value.tilesY; y++) {
        loadImage(x, y)
      }
    }
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateStageSize)
  });

  const updateStageSize = (() => {
    if (!containerRef.value) {
      return
    }
    stageConfig.value.width = containerRef.value.clientWidth
    stageConfig.value.height = containerRef.value.clientHeight
    emitTransformchange()
  })

  const emitTransformchange = (() => {
    const stageNode = stageRef.value?.getNode()
    const layerNode = layerRef.value?.getNode()
    if (!stageNode || !layerNode) {
      return
    }
    let transform = GetMapTransform(stageNode, layerNode)
    if (transform.width === 0 || transform.height === 0) {
      transform = {
        ...transform,
        height: stageConfig.value.height,
        width: stageConfig.value.width,
      }
    }
    emit('transformChanged', transform)
  })

  const onStageWheel = ((e: WheelEvent) => {

    const scaleBy = 0.96
    const stage = stageRef.value?.getNode()
    const layer = layerRef.value?.getNode()
    const pointer = stage?.getPointerPosition()
    const oldScale = layer?.scaleX()

    if (!layer || !pointer || !oldScale) {
      return
    }

    const mousePointTo = {
      x: (pointer.x - layer.x()) / oldScale,
      y: (pointer.y - layer.y()) / oldScale,
    }

    // how to scale? Zoom in? Or zoom out?
    let direction = e.evt.deltaY > 0 ? 1 : -1

    // when we zoom on trackpad, e.evt.ctrlKey is true
    // in that case lets revert direction
    if (e.ctrlKey) {
      direction = -direction
    }

    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy

    layer.scale({x: newScale, y: -newScale})

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    }

    layer.position(newPos)
    emitTransformchange()
  })

  const emitMousePosition = ((event: MouseEvent, eventName: "mouseclick" | "mousemove") => {
    if (!layerRef.value) {
      return
    }
    const layer = layerRef.value?.getNode()
    const position = layer.getRelativePointerPosition()
    if (position) {
      const point: Konva.Vector2d = {x: position.x, y: position.y}
      emit(eventName, event, point)
    }
  })

  const loadImage = (async (x: number, y: number) => {
    try {
      const image = await getImage(x, y)
      if (!image) {
        return
      }
      mapTiles.value.push({
        image,
        x: 512 * constants.value.tileScale * x + constants.value.mapOffsetX,
        y: -512 * constants.value.tileScale * y + constants.value.mapOffsetY,
        scale: {
          x: constants.value.tileScale,
          y: -constants.value.tileScale,
        },
        filters: [Konva.Filters.RGB],
        red: 100,
        green: 2,
        blue: 3,
      })
    } catch (e: any) {
      console.log(e)
    }
  })
  const getImage = (async (x: number, y: number): Promise<HTMLImageElement | null> => {
    const image = new Image()
    const fileEntry = Object.entries(images).find(([path]) =>
      path.endsWith(`tile-${x}_${y}.png`)
    )
    if (!fileEntry) {
      return null
    }
    image.src = (fileEntry![1] as { default: string }).default
    return await new Promise((resolve) => {
      image.onload = () => {
        resolve(image)
      }
    })
  })

  const centerOn = ((targetX: number, targetY: number, targetScale: number | null = null) => {
    const stage = stageRef.value?.getNode()
    if (!stage) {
      console.error("Stage not found")
      return
    }

    const {width, height} = stage.size()

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
  })

  const zoomOn = ((points: Konva.Vector2d[]) => {
    if (!points || !points[0] || points.length === 0) {
      return
    }
    if (points.length === 1) {
      centerOn(points[0].x, points[0].y)
      return
    }

    const stage = stageRef.value?.getNode()
    if (!stage) {
      console.error("Stage not found")
      return
    }
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
      centerOn(points[0].x, points[0].y)
      return
    }

    const centerX = minX + newWidth / 2
    const centerY = minY + newHeight / 2

    const {width, height} = stage.size()

    const scaleX = width / newWidth
    const scaleY = height / newHeight
    const minScale = Math.min(scaleX, scaleY) * 0.98

    centerOn(centerX, centerY, minScale)
  })

  const zoomToFit = (() => {
    zoomOn([
      {x: constants.value.mapOffsetX, y: constants.value.mapOffsetY},
      {x: constants.value.mapOffsetX + mapArea.value.width, y: constants.value.mapOffsetY + mapArea.value.height},
    ])
  })

</script>

<style lang="scss" scoped>
  .konva-container:deep(.konvajs-content) {
    position: absolute !important;
  }

  .map-container {
    width: 100%;
    height: 100%;
  }
</style>
