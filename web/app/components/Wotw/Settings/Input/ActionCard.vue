<template>
  <v-card class="pa-2 d-flex flex-column" variant="tonal">
    <div class="d-flex">
      <h3>{{ gameActionMetadata[action].name }}</h3>
      <v-spacer />
      <v-btn icon flat size="x-small" class="ma-n1" @click="resetBindings">
        <v-icon>mdi-restore</v-icon>
        <v-tooltip activator="parent" location="left" open-delay="400">
          Reset to default
        </v-tooltip>
      </v-btn>
    </div>
    <div>
      <div
        class="d-flex align-start ga-2"
        :class="{'greyed-out': !canControllerRebind}"
      >
        <v-icon size="32">mdi-controller</v-icon>
        <div v-if="canControllerRebind" class="d-flex flex-wrap ga-1 pt-1">
          <wotw-settings-input-controller-bindings-view
            v-if="controllerInputBindings !== undefined"
            :bindings="controllerInputBindings"
            @delete="deleteControllerBinding"
          />

          <v-card class="pa-1 d-flex align-center" flat>
            <v-icon size="x-small">mdi-plus</v-icon>

            <v-menu v-model="controllerRebindEditorOpen" activator="parent" scrim offset="4" :close-on-content-click="false">
              <v-card variant="tonal">
                <div class="pa-3 d-flex flex-column align-center">
                  <wotw-settings-input-controller-bindings-editor
                    v-model="controllerEditingBinding"
                    :action="action as ControllerRebindableAction"
                  />
                </div>
                <v-divider />
                <v-btn
                  size="small"
                  block
                  :rounded="0"
                  :disabled="controllerEditingBinding === null || controllerEditingBinding.length === 0"
                  @click="onControllerBindingsEditorDone"
                >
                  <v-icon start>mdi-check</v-icon>
                  Add
                </v-btn>
              </v-card>
            </v-menu>
          </v-card>
        </div>
        <div v-else class="align-self-center">
          <em>Not rebindable</em>
        </div>
      </div>
      <div
        v-if="canKeyboardAndMouseRebind"
        class="d-flex align-start ga-2"
        :class="{'greyed-out': gameActionMetadata[action].keyboardAndMouse === 'in-game'}"
      >
        <v-icon size="32">mdi-keyboard-outline</v-icon>
        <div v-if="gameActionMetadata[action].keyboardAndMouse === 'in-game'" class="align-self-center">
          <em>Rebind in-game</em>
        </div>
        <div v-else class="d-flex flex-wrap ga-1 pt-1">
          <wotw-settings-input-keyboard-and-mouse-bindings-view
            v-if="keyboardAndMouseInputBindings !== undefined"
            :bindings="keyboardAndMouseInputBindings"
            @delete="deleteKeyboardAndMouseBinding"
          />

          <v-card class="pa-1 d-flex align-center" flat>
            <v-icon size="x-small">mdi-plus</v-icon>

            <v-menu v-model="keyboardAndMouseRebindEditorOpen" activator="parent" scrim offset="4" :close-on-content-click="false">
              <v-card variant="tonal">
                <div class="pa-3 d-flex flex-column align-center">
                  <wotw-settings-input-keyboard-and-mouse-bindings-editor
                    v-model="keyboardAndMouseEditingBinding"
                    :action="action as KeyboardAndMouseRebindableAction"
                  />
                  <div>
                    <v-checkbox
                      v-model="keyboardAndMouseEditingBinding.exactModifiers"
                      label="Exact Modifier Keys"
                      class="mt-3 min-h-0"
                      hide-details
                    />

                    <v-tooltip activator="parent" max-width="500" location="top" open-delay="700">
                      Whether modifier keys such as Ctrl, Alt or Shift must match exactly.<br>
                      Example: Take a binding of LeftAlt + F with Exact Modifier Keys enabled and you press
                      LeftCtrl + LeftAlt + F. In this case the LeftAlt + F binding will not trigger because there is
                      an additional LeftCtrl being pressed.
                    </v-tooltip>
                  </div>
                </div>
                <v-divider />
                <v-btn
                  size="small"
                  block
                  :rounded="0"
                  :disabled="keyboardAndMouseEditingBinding.inputs.length === 0"
                  @click="onKeyboardAndMouseBindingsEditorDone"
                >
                  <v-icon start>mdi-check</v-icon>
                  Add
                </v-btn>
              </v-card>
            </v-menu>
          </v-card>
        </div>
      </div>
    </div>
    <template v-if="!!gameActionMetadata[action].description">
      <div class="flex-grow-1 my-1" />
      <p class="text-body-medium">{{ gameActionMetadata[action].description }}</p>
    </template>
  </v-card>
</template>

<script lang="ts" setup>
  import {
    type ControllerInputBinding,
    type ControllerInputBindings,
    type ControllerRebindableAction,
    type GameAction,
    gameActionMetadata,
    type KeyboardAndMouseInputBinding,
    type KeyboardAndMouseInputBindings,
    type KeyboardAndMouseRebindableAction,
  } from "@shared/data/actions"

  const props = defineProps<{
    action: GameAction,
    controllerInputBindings?: ControllerInputBindings,
    keyboardAndMouseInputBindings?: KeyboardAndMouseInputBindings,
  }>()

  const electronApi = useElectronApi()
  const canControllerRebind = computed(() => gameActionMetadata[props.action].controller !== false)
  const canKeyboardAndMouseRebind = computed(() => gameActionMetadata[props.action].keyboardAndMouse !== false)
  const controllerRebindEditorOpen = ref(false)
  const controllerEditingBinding = ref<ControllerInputBinding | null>(null)
  const keyboardAndMouseEditingBinding = ref<KeyboardAndMouseInputBinding>({
    inputs: [],
    exactModifiers: false,
  })
  const keyboardAndMouseRebindEditorOpen = ref(false)

  watch(controllerRebindEditorOpen, (value) => {
    if (value) {
      controllerEditingBinding.value = null
    }
  })

  watch(keyboardAndMouseRebindEditorOpen, (value) => {
    if (value) {
      keyboardAndMouseEditingBinding.value = {
        inputs: [],
        exactModifiers: false,
      }
    }
  })

  async function addControllerBinding(binding: ControllerInputBinding) {
    if (!electronApi) {
      return
    }

    await electronApi.inputBindings.setControllerActionBindings.query({
      action: props.action as ControllerRebindableAction,
      bindings: [...(props.controllerInputBindings ?? []), binding] as ControllerInputBindings,
    })
  }

  async function addKeyboardBinding(binding: KeyboardAndMouseInputBinding) {
    if (!electronApi) {
      return
    }

    await electronApi.inputBindings.setKeyboardAndMouseActionBindings.query({
      action: props.action as KeyboardAndMouseRebindableAction,
      bindings: [...(props.keyboardAndMouseInputBindings ?? []), binding]
    })
  }

  async function deleteControllerBinding(index: number) {
    if (!electronApi || !props.controllerInputBindings || props.controllerInputBindings.length < index) {
      return
    }

    await electronApi.inputBindings.setControllerActionBindings.query({
      action: props.action as ControllerRebindableAction,
      bindings: props.controllerInputBindings.toSpliced(index, 1)
    })
  }

  async function deleteKeyboardAndMouseBinding(index: number) {
    if (!electronApi || !props.keyboardAndMouseInputBindings || props.keyboardAndMouseInputBindings.length < index) {
      return
    }

    await electronApi.inputBindings.setKeyboardAndMouseActionBindings.query({
      action: props.action as KeyboardAndMouseRebindableAction,
      bindings: props.keyboardAndMouseInputBindings.toSpliced(index, 1)
    })
  }

  async function resetBindings() {
    if (!electronApi) {
      return
    }

    const controllerMetadata = gameActionMetadata[props.action].controller
    const keyboardAndMouseMetadata = gameActionMetadata[props.action].keyboardAndMouse

    if (controllerMetadata !== false) {
      await electronApi.inputBindings.setControllerActionBindings.query({
        action: props.action as ControllerRebindableAction,
        bindings: controllerMetadata.default
      })
    }

    if (keyboardAndMouseMetadata !== false && keyboardAndMouseMetadata !== "in-game") {
      await electronApi.inputBindings.setKeyboardAndMouseActionBindings.query({
        action: props.action as KeyboardAndMouseRebindableAction,
        bindings: keyboardAndMouseMetadata.default
      })
    }
  }

  function onControllerBindingsEditorDone() {
    if (controllerEditingBinding.value === null) {
      return
    }

    addControllerBinding(controllerEditingBinding.value)
    controllerRebindEditorOpen.value = false
  }

  function onKeyboardAndMouseBindingsEditorDone() {
    addKeyboardBinding(keyboardAndMouseEditingBinding.value)
    keyboardAndMouseRebindEditorOpen.value = false
  }
</script>

<style lang="scss" scoped>
  .greyed-out {
    opacity: 0.4;
  }

  .min-h-0 {
    min-height: 0;
  }
</style>
