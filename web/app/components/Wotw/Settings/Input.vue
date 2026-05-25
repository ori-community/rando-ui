<template>
  <div>
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

    <div class="d-flex justify-end">
      <v-btn color="primary" variant="tonal">
        <v-icon start>mdi-restore</v-icon>
        Reset all to default

        <v-dialog v-model="resetAllDialogOpen" activator="parent" max-width="500">
          <v-card title="Reset all to default">
            <template #text>
              This will remove all your changes to input bindings and reset them to the default
              bindings that come with the randomizer. Changes to keybinds made in-game are not affected.
            </template>
            <template #actions>
              <v-btn class="mr-1" text @click="resetAllDialogOpen = false">
                Cancel
              </v-btn>
              <v-btn
                depressed
                color="error"
                variant="flat"
                @click="resetAll"
              >
                <v-icon start>mdi-restore</v-icon>
                Reset
              </v-btn>
            </template>
          </v-card>
        </v-dialog>
      </v-btn>
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
  const resetAllDialogOpen = ref(false)
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

  async function resetAll() {
    await electronApi?.inputBindings.resetAllBindings.query()
    resetAllDialogOpen.value = false
  }
</script>

<style lang="scss" scoped>
  .inputs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
</style>
