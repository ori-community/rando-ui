<template>
  <div class="d-flex flex-column align-center">
    <div class="mb-2">
      Press
      <template v-if="rebindType === 'single'">input</template>
      <template v-else-if="rebindType === 'composable'">inputs</template>
      for <strong>{{ gameActionMetadata[action].name }}</strong>...
    </div>

    <wotw-settings-input-controller-bindings-view
      :bindings="[model] as ControllerInputBindings"
      :can-delete="false"
    />

    <div class="pt-2 text-body-medium">
      <template v-if="rebindType === 'single'">This action does not support input combinations.</template>
      <template v-if="rebindType === 'composable'">This action supports input combinations.</template>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import {useVModel} from "@vueuse/core"
  import {
    type ComposableControllerInputBinding,
    type ControllerInputBinding,
    type ControllerInputBindings,
    type ControllerRebindableAction,
    gameActionMetadata,
  } from "@shared/data/actions"
  import {type ControllerInput, controllerInputsByWebId} from "@shared/data/input"

  const props = defineProps<{
    action: ControllerRebindableAction,
    modelValue: ControllerInputBinding | null,
  }>()

  const emits = defineEmits<{
    "update:modelValue": [ControllerInputBinding | null],
  }>()

  const model = useVModel(props, "modelValue", emits)
  const gamepad = shallowRef<Gamepad | null>(null)
  const updateIntervalId = ref<number | null>(null)

  const rebindType = computed(() => {
    const controllerMetadata = gameActionMetadata[props.action]
    return controllerMetadata.controller.type
  })

  onMounted(() => {
    window.addEventListener("gamepadconnected", updateGamepad)
    window.addEventListener("gamepaddisconnected", updateGamepad)
    updateGamepad()

    updateIntervalId.value = window.setInterval(() => {
      const pressedButtons = getPressedButtons()

      switch (rebindType.value) {
        case "single":
          if (pressedButtons.length > 0) {
            model.value = pressedButtons[0]!
          }
          break;
        case "composable":
          if (model.value === null) {
            model.value = []
          }

          for (const button of pressedButtons) {
            if (!model.value.includes(button)) {
              (model.value as ComposableControllerInputBinding).push(button)
            }
          }
          break;
      }
    }, 100)
  })

  onBeforeUnmount(() => {
    window.removeEventListener("gamepadconnected", updateGamepad)
    window.removeEventListener("gamepaddisconnected", updateGamepad)

    if (updateIntervalId.value !== null) {
      clearInterval(updateIntervalId.value)
    }
  })

  function getPressedButtons(): ControllerInput[] {
    updateGamepad()
    if (!gamepad.value) {
      return []
    }

    const inputs: ControllerInput[] = []

    for (let i = 0; i < gamepad.value.buttons.length; i++) {
      const controllerInput = controllerInputsByWebId.get(i)
      if (!controllerInput) {
        continue
      }

      const button = gamepad.value.buttons[i]!
      if (button.pressed) {
        inputs.push(controllerInput)
      }
    }

    // Virtual axis buttons
    if ((gamepad.value.axes[0] ?? 0) < -0.5) inputs.push("LeftStickLeft")
    if ((gamepad.value.axes[0] ?? 0) > 0.5) inputs.push("LeftStickRight")
    if ((gamepad.value.axes[1] ?? 0) < -0.5) inputs.push("LeftStickUp")
    if ((gamepad.value.axes[1] ?? 0) > 0.5) inputs.push("LeftStickDown")
    if ((gamepad.value.axes[2] ?? 0) < -0.5) inputs.push("RightStickLeft")
    if ((gamepad.value.axes[2] ?? 0) > 0.5) inputs.push("RightStickRight")
    if ((gamepad.value.axes[3] ?? 0) < -0.5) inputs.push("RightStickUp")
    if ((gamepad.value.axes[3] ?? 0) > 0.5) inputs.push("RightStickDown")

    return inputs
  }

  function updateGamepad() {
    gamepad.value = null

    for (const availableGamepad of navigator.getGamepads()) {
      if (availableGamepad) {
        gamepad.value = availableGamepad
        break
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
