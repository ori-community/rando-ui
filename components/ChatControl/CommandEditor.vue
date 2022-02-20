<template>
  <div>
    <div class='mb-8'>
      <v-text-field v-model='inputValue.name' autofocus hide-details label='Name' />
    </div>

    <div class='mb-8'>
      <h3 class='mb-1'>Triggers</h3>

      <v-list v-if='inputValue.triggers.length > 0' outlined class='mb-1'>
        <v-list-item v-for='(trigger, index) in inputValue.triggers' :key='index'>
          <v-list-item-title>
            <chat-control-trigger-view
              :trigger='trigger'
              :available-rewards='availableRewards'
            />
          </v-list-item-title>
          <v-list-item-action>
            <v-btn small icon @click='inputValue.triggers.splice(index, 1)'>
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>

      <v-menu offset-y>
        <template #activator='{on, attrs}'>
          <v-btn text v-bind='attrs' v-on='on'>
            <v-icon left>mdi-plus</v-icon>
            Add trigger
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click='addChatCommandTriggerDialogOpen = true'>Chat command</v-list-item>
          <v-list-item @click='addChannelRewardTriggerDialogOpen = true'>Channel reward</v-list-item>
        </v-list>
      </v-menu>
    </div>

    <v-textarea v-model='inputValue.script' class='monospace' outlined label='Script' />

    <v-dialog v-model='addChannelRewardTriggerDialogOpen'>
      <v-card>
        <div class='pa-5'>
          <v-select
            v-model='selectedChannelReward'
            :items='availableRewards'
            item-value='id'
            placeholder='Select reward'
          >
            <template #selection='{item}'>
              {{ item.title }} ({{ item.cost }})
            </template>
            <template #item='{item}'>
              {{ item.title }} ({{ item.cost }})
            </template>
          </v-select>

          <div class='d-flex justify-end'>
            <v-btn :disabled='selectedChannelReward === null' depressed color='accent' @click='addChannelReward'>
              Add
            </v-btn>
          </div>
        </div>
      </v-card>
    </v-dialog>

    <v-dialog v-model='addChatCommandTriggerDialogOpen'>
      <v-card>
        <div class='pa-5'>
          <v-text-field v-model='selectedChatAction' autofocus label='Command' prefix='!' @keydown.enter='addChatCommand' />

          <div class='d-flex justify-end'>
            <v-btn :disabled='!selectedChatAction' depressed color='accent' @click='addChatCommand'>
              Add
            </v-btn>
          </div>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  export default {
    name: 'CommandEditor',
    props: {
      value: {
        type: Object,
        required: true,
      },
      availableRewards: {
        type: Array,
        default: () => ([]),
      },
    },
    data: vm => ({
      inputValue: vm.value,
      addChatCommandTriggerDialogOpen: false,
      addChannelRewardTriggerDialogOpen: false,
      selectedChannelReward: null,
      selectedChatAction: '',
    }),
    watch: {
      value(value) {
        this.inputValue = value
      },
      inputValue(value) {
        this.$emit('input', value)
      },
    },
    methods: {
      addChannelReward() {
        this.inputValue.triggers.push({
          type: 'reward',
          rewardId: this.selectedChannelReward,
        })

        this.selectedChannelReward = null
        this.addChannelRewardTriggerDialogOpen = false
      },
      addChatCommand() {
        this.inputValue.triggers.push({
          type: 'command',
          action: this.selectedChatAction,
        })

        this.selectedChatAction = ''
        this.addChatCommandTriggerDialogOpen = false
      }
    },
  }
</script>

<style lang='scss' scoped>
  .monospace {
    font-family: "Fira Code", "Consolas", monospace;
  }
</style>
