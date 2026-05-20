<template>
  <div v-if="engineLoading" class="position-absolute d-flex flex-column ga-2 justify-center align-center top-0 left-0 right-0 bottom-0">
    <v-progress-circular reveal indeterminate />
    <div>Loading</div>
  </div>
  <canvas id="map-canvas" ref="canvas" class="canvas" :class="{loading: engineLoading}" />
</template>

<script lang="ts" setup>
  import { Engine } from '@ori-community/wotw-map'

  export type SaveFile = {
    data: ArrayBuffer,
    name: string,
  }

  const props = defineProps<{
    saveFiles: SaveFile[],
  }>()

  const canvas = ref<HTMLCanvasElement | null>(null)
  const engineLoading = ref(false)
  const resizeObserver = new ResizeObserver(updateCanvasSize)
  const engine = shallowRef<Engine | null>(null)
  const engineReady = ref(false)

  watch(canvas, async (value, oldValue) => {
    if (oldValue !== null) {
      resizeObserver.unobserve(oldValue)
    }

    if (engineLoading.value || value === null) {
      return
    }

    engineReady.value = false
    resizeObserver.observe(value)
    updateCanvasSize()

    engineLoading.value = true
    window.__godotBridge = {
      onGodotReady: () => {
        engineReady.value = true
        updateEngineWindowScale()
        loadSaveFiles()
      },
      call: () => {
        // This callback is replaced by the Engine at startup
        console.warn("Tried to call Godot bridge but the engine was not ready yet.")
      }
    }

    engine.value = new Engine({
      args: ['--main-pack', "/wotw-map/wotw-map.pck"],
      canvasResizePolicy: 0,
      canvas: value,
      focusCanvas: false,
      persistentPaths: [],
    })

    await Promise.all([
      engine.value.init("/wotw-map/wotw-map"),
      engine.value.preloadFile("/wotw-map/wotw-map.pck"),
    ])

    await engine.value.start()

    engineLoading.value = false
  })

  onBeforeUnmount(() => {
    if (engine.value) {
      engine.value.requestQuit()
    }
  })

  function loadSaveFiles() {
    window.__godotBridge?.call("load_save_files", toRaw(props.saveFiles))
  }

  function updateEngineWindowScale() {
    window.__godotBridge?.call("set_window_scale", window.devicePixelRatio)
  }

  function updateCanvasSize() {
    if (canvas.value === null) {
      return
    }

    canvas.value.width = canvas.value.offsetWidth * window.devicePixelRatio
    canvas.value.height = canvas.value.offsetHeight * window.devicePixelRatio

    if (engineReady.value) {
      updateEngineWindowScale()
    }
  }
</script>

<style lang="scss" scoped>
  .canvas {
    display: block;
    width: 100%;
    height: 100%;
    transition: opacity 200ms;

    &.loading {
      opacity: 0;
      pointer-events: none;
    }

    &:focus-visible {
      outline: none;
    }
  }
</style>
