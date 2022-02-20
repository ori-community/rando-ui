<template>
  <div>
    <v-list v-if='inputValue.length > 0' class='mb-2'>
      <v-list-item v-for='(command, index) in inputValue' :key='command.id' @click='editCommand(index)'>
        <v-list-item-title>{{ command.name }}</v-list-item-title>
        <v-fade-transition>
          <v-list-item-action v-if='activeCommands.includes(command.id)'>
            <v-icon color='green'>mdi-circle</v-icon>
          </v-list-item-action>
        </v-fade-transition>
        <v-list-item-action>
          <v-btn small icon @click.capture.stop='deleteCommand(index)'>
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>

    <v-btn text @click='addCommand'>
      <v-icon left>mdi-plus</v-icon>
      Add command
    </v-btn>
    <v-tooltip bottom>
      <template #activator='{on, attrs}'>
        <v-btn v-bind='attrs' icon v-on='on' @click='$emit("import")'>
          <v-icon>mdi-database-import-outline</v-icon>
        </v-btn>
      </template>
      <span>Import</span>
    </v-tooltip>
    <v-tooltip bottom>
      <template #activator='{on, attrs}'>
        <v-btn v-bind='attrs' icon v-on='on' @click='$emit("export")'>
          <v-icon>mdi-database-export-outline</v-icon>
        </v-btn>
      </template>
      <span>Export</span>
    </v-tooltip>

    <v-dialog v-model='editDialogOpen' fullscreen>
      <v-card>
        <div class='pa-5'>
          <div class='d-flex'>
            <h2>Edit command</h2>
            <v-spacer />
            <v-btn icon @click='editDialogOpen = false'>
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <chat-control-command-editor
            v-if='editIndex !== null && editDialogOpen'
            v-model='inputValue[editIndex]'
            :available-rewards='availableChannelRewards'
          />
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import { v4 as uuidv4 } from 'uuid'

  export default {
    name: 'ScriptsEditor',
    props: {
      value: {
        type: Array,
        required: true,
      },
      activeCommands: {
        type: Array,
        default: () => ([])
      },
    },
    data: vm => ({
      inputValue: vm.value,
      editDialogOpen: false,
      editIndex: null,
      availableChannelRewards: [],
    }),
    watch: {
      inputValue(value) {
        this.$emit('input', value)
      },
    },
    methods: {
      addCommand() {
        this.inputValue.push({
          id: uuidv4(),
          name: '',
          triggers: [],
          script: '',
        })
        this.editCommand(this.inputValue.length - 1)
      },
      async editCommand(index) {
        this.editIndex = index
        this.editDialogOpen = true

        try {
          this.availableChannelRewards = await window.electronApi.invoke('chatControl.getRewards')
        } catch (e) {
          console.error(e)
          this.availableChannelRewards = []
        }
      },
      deleteCommand(index) {
        if (confirm('Really?')) {
          this.inputValue.splice(index, 1)
        }
      },
    }
  }
</script>

<style scoped>

</style>
