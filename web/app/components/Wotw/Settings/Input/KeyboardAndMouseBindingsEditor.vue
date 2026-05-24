<template>
  <div class="d-flex">
    <wotw-settings-input-keyboard-and-mouse-bindings-view
      :bindings="[model]"
      :can-delete="false"
    />
  </div>
</template>

<script lang="ts" setup>
  import {useVModel} from "@vueuse/core"
  import type {KeyboardAndMouseInputBinding} from "@shared/data/actions"
  import {keyboardAndMouseInputsByWebId} from "@shared/data/input"

  const props = defineProps<{
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
</script>

<style lang="scss" scoped>

</style>
