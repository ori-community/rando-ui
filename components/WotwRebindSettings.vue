<template>
  <div>
    <div v-if='type === "controller"' class='controller-status'>
      <v-sheet :color='gamepad === null ? "warning darken-2" : "success darken-2"' rounded width='1em' height='1em' />
      <div v-if='gamepad === null'>
        Connect your controller and <b>press any button</b>.
      </div>
      <div v-else>
        {{ gamepadId }}
      </div>
    </div>

    <v-list>
      <v-list-item v-for='action in availableActionsList' :key='action.name'>
        <v-list-item-icon>
          <v-icon v-if='boundActions[action.name].length > 0'>mdi-link-variant</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>
            {{ action.displayName }}

            <v-tooltip v-if='action.composable' top>
              <span>Supports button combinations</span>
              <template #activator='{on}'>
                <v-icon color='background lighten-4' small v-on='on'>
                  mdi-circle-multiple
                </v-icon>
              </template>
            </v-tooltip>

            <v-tooltip :disabled='editorIsReady' right>
              <span>Connect a controller and press a button first</span>
              <template #activator='{on}'>
                <span v-on='on'>
                  <v-btn
                    x-small
                    color='background lighten-2'
                    class='ml-2'
                    depressed
                    :disabled='!editorIsReady'
                    @click='registerBindingForAction(action.name)'
                  >Add bind</v-btn>
                </span>
              </template>
            </v-tooltip>
          </v-list-item-title>
          <v-list-item-subtitle>
            <div v-for='(binding, index) in boundActions[action.name]' :key='index'>
              <v-btn x-small icon @click='removeBinding(action.name, index)'>
                <v-icon>mdi-close</v-icon>
              </v-btn>
              {{
                type === 'controller'
                  ? binding.map(getButtonNameForUnityId).join(' + ')
                  : binding.keys.map(getButtonNameForUnityId).join(' + ')
              }}
              <v-tooltip v-if='binding.respects_modifiers' right>
                <span>Exactly match modifiers</span>
                <template #activator='{on}'>
                  <v-icon color='background lighten-4' small v-on='on'>
                    mdi-target
                  </v-icon>
                </template>
              </v-tooltip>
            </div>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-icon />
        <v-list-item-content class='d-block'>
          <v-btn color='error' :disabled='allBindingsReset' depressed @click='resetAllToDefault'>
            Reset all to default
          </v-btn>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <v-dialog v-model='bindingEditor.dialogOpen' max-width='300px'>
      <v-card class='binding-editor pa-8'>
        <v-sheet v-if='type === "kbm"' color='primary darken-2' rounded class='mouse-target' @mousedown='onKeyOrMouseDown' @mouseup.prevent>
          <v-icon size='64'>mdi-cursor-default-click-outline</v-icon>
          <div class='mt-2'>
            For mouse bindings, click here
          </div>
        </v-sheet>

        <div class='text-center'>
          Press button(s) for<br>
          <b>{{ bindingEditor.editingActionName }}</b>
        </div>

        <div class='pressed-buttons'>
          <wotw-rebind-settings-button
            v-for='button in bindingEditor.pressedButtons'
            :key='button'
            :button='getButtonNameForUnityId(button)'
          />
        </div>

        <v-alert v-if='bindingEditor.showComposingBindDisallowedHint' color='error' class='text-center mb-0'>
          Button combinations are not possible for vanilla actions.
        </v-alert>

        <template v-if='type === "kbm"'>
          <v-checkbox v-model='bindingEditor.exactlyMatchModifierKeys' label='Exactly match modifier keys' hide-details />
          <v-btn :disabled='bindingEditor.pressedButtons.length === 0' color='accent' block depressed @click='addBindingFromBindingEditor'>
            Save
          </v-btn>
        </template>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import controllerActions from '~/assets/electron/controllerActions.yaml'
  import controllerButtons from '~/assets/electron/controllerButtons.yaml'
  import keyboardActions from '~/assets/electron/keyboardActions.yaml'
  import keyboardButtons from '~/assets/electron/keyboardButtons.yaml'
  import { InputRebindService } from '~/assets/lib/InputRebindService'

  export default {
    name: 'WotwRebindSettings',
    props: {
      type: { // = "controller" or "kbm"
        type: String,
        default: 'controller',
      },
    },
    data: () => ({
      gamepad: null,
      boundActions: {},
      bindingEditor: {
        dialogOpen: false,
        gamepadCheckIntervalId: null,
        showComposingBindDisallowedHint: false,
        exactlyMatchModifierKeys: false,
        editingActionName: '',
        pressedButtons: [],
      },
      allBindingsReset: false,
    }),
    computed: {
      gamepadId() {
        return this.gamepad?.id
      },
      editorIsReady() {
        return this.type === 'controller'
          ? !!this.gamepad
          : true
      },
      availableButtons() {
        return this.type === 'controller'
          ? controllerButtons
          : keyboardButtons
      },
      availableActions() {
        return this.type === 'controller'
          ? controllerActions
          : keyboardActions
      },
      currentEditingBindingIsComposable() {
        return !!this.availableActions[this.bindingEditor.editingActionName]?.composable
      },
      availableActionsList() {
        const list = []
        for (const [name, action] of Object.entries(this.availableActions)) {
          list.push({
            name,
            ...action,
          })
        }
        return list
      },
    },
    watch: {
      'bindingEditor.dialogOpen'(dialogOpen) {
        if (!dialogOpen && this.bindingEditor.gamepadCheckIntervalId !== null) {
          if (this.bindingEditor.gamepadCheckIntervalId) {
            clearInterval(this.bindingEditor.gamepadCheckIntervalId)
          }
          this.bindingEditor.selectedActionName = null
        }
      },
      'bindingEditor.selectedActionName'(selectedActionName) {
        if (selectedActionName) {
          this.registerBindingForAction(selectedActionName)
        }
      },
      boundActions: {
        deep: true,
        handler() {
          this.allBindingsReset = false
        }
      }
    },
    beforeMount() {
      for (const action of this.availableActionsList) {
        this.$set(this.boundActions, action.name, [])
      }
    },
    mounted() {
      this.loadBindings()
      window.addEventListener('gamepadconnected', this.updateGamepad)
      window.addEventListener('gamepaddisconnected', this.updateGamepad)
      window.addEventListener('keydown', this.onKeyOrMouseDown, {capture: true})
      this.updateGamepad()
    },
    beforeDestroy() {
      window.removeEventListener('gamepadconnected', this.updateGamepad)
      window.removeEventListener('gamepaddisconnected', this.updateGamepad)
      window.removeEventListener('keydown', this.onKeyOrMouseDown)
    },
    methods: {
      async loadBindings() {
        const savedBindings = this.type === 'controller'
          ? await window.electronApi.invoke('bindings.loadControllerBindings')
          : await window.electronApi.invoke('bindings.loadKeyboardBindings')

        this.boundActions = {
          ...this.boundActions,
          ...savedBindings,
        }
      },
      async saveBindings() {
        this.type === 'controller'
          ? await window.electronApi.invoke('bindings.saveControllerBindings', this.boundActions)
          : await window.electronApi.invoke('bindings.saveKeyboardBindings', this.boundActions)
      },
      updateGamepad() {
        const gamepads = navigator.getGamepads()
        this.gamepad = null
        for (const gamepad of gamepads) {
          if (gamepad) {
            this.gamepad = gamepad
            break
          }
        }
      },
      registerBindingForAction(actionName) {
        this.bindingEditor.editingActionName = actionName
        this.bindingEditor.pressedButtons = []
        this.bindingEditor.showComposingBindDisallowedHint = false
        this.bindingEditor.exactlyMatchModifierKeys = false

        if (this.type === 'controller') { // Controller binding
          this.bindingEditor.gamepadCheckIntervalId = setInterval(() => {
            this.updateGamepad()
            if (this.gamepad) {
              const pressedButtons = InputRebindService.getPressedGamepadButtonsUnityIds(this.gamepad)

              if (pressedButtons.length === 0 && this.bindingEditor.pressedButtons.length > 0) {
                this.addBindingFromBindingEditor()
                return
              }

              for (const button of pressedButtons) {
                if (!this.bindingEditor.pressedButtons.includes(button)) {
                  if (this.bindingEditor.pressedButtons.length > 0 && !this.currentEditingBindingIsComposable) {
                    this.bindingEditor.showComposingBindDisallowedHint = true
                    break
                  }

                  this.bindingEditor.pressedButtons.push(button)
                }
              }
            } else {
              this.bindingEditor.dialogOpen = false
            }
          }, 100)
        } else { // Keyboard binding

        }

        this.bindingEditor.dialogOpen = true
      },
      addBindingFromBindingEditor() {
        this.bindingEditor.dialogOpen = false
        this.boundActions[this.bindingEditor.editingActionName].push(
          this.type === 'controller'
            ? [...this.bindingEditor.pressedButtons]
            : {
              keys: [...this.bindingEditor.pressedButtons],
              respects_modifiers: this.bindingEditor.exactlyMatchModifierKeys,
            }
        )
        this.saveBindings().catch(console.error)
      },
      getButtonNameForUnityId(targetUnityId) {
        const button = Object.entries(this.availableButtons)
          .find(([, {unityId}]) => unityId === targetUnityId)

        if (!button) {
          return `[Button id=${targetUnityId}]`
        }

        return button[1].displayName ?? button[0];
      },
      onKeyOrMouseDown(event) {
        if (!this.bindingEditor.dialogOpen || this.type !== 'kbm') {
          return
        }

        event.preventDefault()
        event.stopPropagation()

        if (!event.repeated) {
          const unityId = InputRebindService.getKbmEventUnityId(event)

          if (unityId && !this.bindingEditor.pressedButtons.includes(unityId)) {
            this.bindingEditor.pressedButtons.push(unityId)
          }
        }
      },
      async resetAllToDefault() {
        if (this.type === 'controller') {
          await window.electronApi.invoke('bindings.resetControllerBindings')
        } else {
          await window.electronApi.invoke('bindings.resetKeyboardBindings')
        }

        await this.loadBindings()

        this.allBindingsReset = true
      },
      removeBinding(actionName, index) {
        this.boundActions[actionName].splice(index, 1)
        this.saveBindings().catch(console.error)
      },
    }
  }
</script>

<style lang='scss' scoped>
  .controller-status {
    display: flex;
    align-items: center;
    gap: 1em;
  }

  .pressed-buttons {
    display: flex;
    justify-content: center;
    gap: 0.5em;
    flex-wrap: wrap;
  }

  .binding-editor {
    display: flex;
    flex-direction: column;
    gap: 1em;
  }

  .mouse-target {
    display: flex;
    padding: 2em;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    text-align: center;

    * {
      pointer-events: none;
    }
  }
</style>
