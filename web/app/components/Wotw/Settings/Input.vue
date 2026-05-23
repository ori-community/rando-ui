<template>
  <div v-for="gameActionCategory in gameActionCategories" :key="gameActionCategory">
    <h2 class="mb-1">{{ gameActionCategoryMetadata[gameActionCategory].name }}</h2>

    <div v-if="controllerBindings !== undefined && keyboardAndMouseBindings !== undefined" class="inputs-grid ga-1 mb-5">
      <wotw-settings-input-action-card
        v-for="action in gameActionsByCategory.get(gameActionCategory)?.filter(isRebindable)"
        :key="action"
        :action="action"
        :controller-input-bindings="getControllerBindingsOrUndefined(action)"
        :keyboard-and-mouse-input-bindings="getKeyboardAndMouseBindingsOrUndefined(action)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import {
    type ControllerBindings, type ControllerRebindableAction,
    type GameAction,
    gameActionCategories,
    gameActionCategoryMetadata, gameActionMetadata,
    gameActionsByCategory, type KeyboardAndMouseBindings, type KeyboardAndMouseRebindableAction,
  } from "@shared/data/actions"

  const electronApi = useElectronApi()

  const controllerBindings = ref<ControllerBindings | undefined>(undefined)
  const keyboardAndMouseBindings = ref<KeyboardAndMouseBindings | undefined>(undefined)
  const unsubscribables: {unsubscribe: () => void}[] = []

  onMounted(() => {
    if (electronApi) {
      unsubscribables.push(
        electronApi.inputBindings.controllerBindings.subscribe(undefined, {
          onData(value) {
            controllerBindings.value = value
          },
        }),
      )

      unsubscribables.push(
        electronApi.inputBindings.keyboardAndMouseBindings.subscribe(undefined, {
          onData(value) {
            keyboardAndMouseBindings.value = value
          },
        })
      )
    }
  })

  onBeforeUnmount(() => {
    for (const unsubscribable of unsubscribables) {
      unsubscribable.unsubscribe()
    }
  })

  function isRebindable(action: GameAction) {
    const actionMetadata = gameActionMetadata[action]
    return actionMetadata.controller !== false || actionMetadata.keyboardAndMouse !== false
  }

  function getControllerBindingsOrUndefined(action: GameAction) {
    return controllerBindings.value?.[action as ControllerRebindableAction]
  }

  function getKeyboardAndMouseBindingsOrUndefined(action: GameAction) {
    return keyboardAndMouseBindings.value?.[action as KeyboardAndMouseRebindableAction]
  }
</script>

<style lang="scss" scoped>
  .inputs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
</style>
