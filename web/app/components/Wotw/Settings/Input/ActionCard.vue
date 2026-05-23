<template>
  <v-card class="pa-2" variant="tonal">
    <h3>{{ gameActionMetadata[action].name }}</h3>

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
          />

          <v-card class="pa-1 d-flex align-center" flat @click="addControllerBinding">
            <v-icon size="x-small">mdi-plus</v-icon>
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
          />

          <v-card class="pa-1 d-flex align-center" flat @click="addKeyboardBinding">
            <v-icon size="x-small">mdi-plus</v-icon>
          </v-card>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script lang="ts" setup>
  import {
    type ControllerInputBindings,
    type GameAction,
    gameActionMetadata,
    type KeyboardAndMouseInputBindings,
  } from "@shared/data/actions"

  const props = defineProps<{
    action: GameAction,
    controllerInputBindings?: ControllerInputBindings,
    keyboardAndMouseInputBindings?: KeyboardAndMouseInputBindings,
  }>()

  const canControllerRebind = computed(() => gameActionMetadata[props.action].controller !== false)
  const canKeyboardAndMouseRebind = computed(() => gameActionMetadata[props.action].keyboardAndMouse !== false)

  function addControllerBinding() {

  }

  function addKeyboardBinding() {

  }
</script>

<style lang="scss" scoped>
  .greyed-out {
    opacity: 0.4;
  }
</style>
