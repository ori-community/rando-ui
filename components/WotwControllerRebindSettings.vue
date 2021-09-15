<template>
  <div>
    <div class='controller-status'>
      <v-sheet :color='gamepad === null ? "warning darken-2" : "success darken-2"' rounded width='1em' height='1em' />
      <div v-if='gamepad === null'>
        Connect your controller and <b>press any button</b>.
      </div>
      <div v-else>
        {{ gamepadId }}
      </div>
    </div>

    <v-list>
      <v-list-item v-for='action in controllerActionsList' :key='action.name'>
        <v-list-item-icon>
          <v-icon v-if='boundActions[action.name].length > 0'>mdi-link-variant</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>
            {{ action.displayName }}

            <v-tooltip v-if='action.composable' top>
              <span>Supports button combinations</span>
              <template #activator='{on}'>
                <v-icon small v-on='on'>
                  mdi-circle-multiple
                </v-icon>
              </template>
            </v-tooltip>

            <v-btn
              x-small
              color='background lighten-2'
              class='ml-2'
              depressed
              :disabled='!gamepad'
              @click='registerBindingForAction(action.name)'
            >Add bind</v-btn>
          </v-list-item-title>
          <v-list-item-subtitle>
            <div v-for='(binding, index) in boundActions[action.name]' :key='index'>
              {{ binding.map(getButtonNameForUnityId).join(' + ') }}
              <v-btn x-small icon @click='boundActions[action.name].splice(index, 1)'>
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <v-dialog v-model='bindingEditor.dialogOpen' max-width='300px'>
      <v-card class='binding-editor pa-8'>
        <div class='text-center'>
          Press button(s) for<br>
          <b>{{ bindingEditor.editingActionName }}</b>
        </div>

        <div class='pressed-buttons'>
          <wotw-controller-button
            v-for='button in bindingEditor.pressedButtons'
            :key='button'
            :button='getButtonNameForUnityId(button)'
          />
        </div>

        <v-alert v-if='bindingEditor.showComposingBindDisallowedHint' color='error' class='text-center mb-0'>
          Button combinations are not possible for vanilla actions.
        </v-alert>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import controllerActions from '~/assets/electron/controllerActions.yaml'
  import controllerButtons from '~/assets/electron/controllerButtons.yaml'
  import { GamepadService } from '~/assets/lib/GamepadService'

  export default {
    name: 'WotwControllerRebindSettings',
    data: () => ({
      gamepad: null,
      boundActions: {},
      bindingEditor: {
        dialogOpen: false,
        gamepadCheckIntervalId: null,
        showComposingBindDisallowedHint: false,
        editingActionName: '',
        pressedButtons: [],
      }
    }),
    computed: {
      gamepadId() {
        return this.gamepad?.id
      },
      controllerActionsList() {
        const list = []
        for (const [name, action] of Object.entries(controllerActions)) {
          list.push({
            name,
            ...action,
          })
        }
        return list
      },
      currentEditingBindingIsComposable() {
        return !!controllerActions[this.bindingEditor.editingActionName]?.composable
      }
    },
    watch: {
      'bindingEditor.dialogOpen'(dialogOpen) {
        if (!dialogOpen && this.bindingEditor.gamepadCheckIntervalId !== null) {
          clearInterval(this.bindingEditor.gamepadCheckIntervalId)
          this.bindingEditor.selectedActionName = null
        }
      },
      'bindingEditor.selectedActionName'(selectedActionName) {
        if (selectedActionName) {
          this.registerBindingForAction(selectedActionName)
        }
      },
    },
    beforeMount() {
      for (const action of this.controllerActionsList) {
        this.$set(this.boundActions, action.name, [])
      }
    },
    mounted() {
      this.loadBindings()

      window.addEventListener('gamepadconnected', this.updateGamepad)
      window.addEventListener('gamepaddisconnected', this.updateGamepad)
      this.updateGamepad()
    },
    beforeDestroy() {
      window.removeEventListener('gamepadconnected', this.updateGamepad)
      window.removeEventListener('gamepaddisconnected', this.updateGamepad)
    },
    methods: {
      async loadBindings() {
        this.boundActions = {
          ...this.boundActions,
          ...await window.electronApi.invoke('bindings.loadControllerBindings')
        }
      },
      async saveBindings() {
        await window.electronApi.invoke('bindings.saveControllerBindings', this.boundActions)
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

        this.bindingEditor.gamepadCheckIntervalId = setInterval(() => {
          this.updateGamepad()
          if (this.gamepad) {
            const pressedButtons = GamepadService.getPressedButtons(this.gamepad)

            if (pressedButtons.length === 0 && this.bindingEditor.pressedButtons.length > 0) {
              this.bindingEditor.dialogOpen = false
              this.boundActions[actionName].push([...this.bindingEditor.pressedButtons])
              this.saveBindings().catch(console.error)
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
        this.bindingEditor.dialogOpen = true
      },
      getButtonNameForUnityId(targetUnityId) {
        return Object.entries(controllerButtons)
          .find(([, {unityId}]) => unityId === targetUnityId)[0]
      }
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
</style>
