<template>
  <div class="d-flex flex-column align-center">
    <div class="mb-2">
      Press keys for <strong>{{ gameActionMetadata[action].name }}</strong>...
    </div>

    <v-card flat variant="tonal" color="blue" class="pa-4 mb-3 mouse-target" @mousedown="onMouseDown" @mouseup="onMouseUp">
      <v-icon>mdi-cursor-default-click-outline</v-icon>
      Click here for mouse inputs
    </v-card>

    <wotw-settings-input-keyboard-and-mouse-bindings-view
      :bindings="[model]"
      :can-delete="false"
    />
  </div>
</template>

<script lang="ts" setup>
  import {useVModel} from "@vueuse/core"
  import {
    gameActionMetadata,
    type KeyboardAndMouseInputBinding,
    type KeyboardAndMouseRebindableAction,
  } from "@shared/data/actions"
  import {keyboardAndMouseInputsByWebId} from "@shared/data/input"

  const props = defineProps<{
    action: KeyboardAndMouseRebindableAction,
    modelValue: KeyboardAndMouseInputBinding,
  }>()

  const emits = defineEmits<{
    "update:modelValue": [KeyboardAndMouseInputBinding],
  }>()

  const model = useVModel(props, "modelValue", emits)

  onMounted(() => {
    window.addEventListener("keydown", onKeyDown, {capture: true})
  })

  onBeforeUnmount(() => {
    window.removeEventListener("keydown", onKeyDown, {capture: true})
  })

  function onKeyDown(e: KeyboardEvent) {
    e.preventDefault()
    e.stopPropagation()

    const input = keyboardAndMouseInputsByWebId.get(e.code)
    if (input && !model.value.inputs.includes(input)) {
      model.value.inputs.push(input)
    }
  }

  function onMouseDown(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    const input = keyboardAndMouseInputsByWebId.get(`Mouse${e.button}`)
    if (input && !model.value.inputs.includes(input)) {
      model.value.inputs.push(input)
    }
  }

  function onMouseUp(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
  }
</script>

<style lang="scss" scoped>
  .mouse-target {
    user-select: none;

    * {
      pointer-events: none;
    }
  }
</style>
