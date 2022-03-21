<template>
  <div>
    <v-dialog v-model='editDialogOpen' persistent class='pa-0'>
      <v-card height='90vh' min-width='90vw' class='overflow-hidden d-flex flex-column'>
        <div class='px-5 pt-3'>
          <v-text-field v-model='editingHeaderName' autofocus label='Header name' />
        </div>
        <div class='flex-grow-1 relative'>
          <lazy-monaco-editor
            v-if='editDialogOpen'
            v-model='editingHeaderContent'
            class='fill'
            :options='{
              automaticLayout: true,
              theme: "ori-wotw-rando",
              overviewRulerBorder: false,
              language: "ori-wotw-rando-header",
              fontFamily: "\"Fira Code\", Consolas, monospace",
              minimap: {
                enabled: false
              },
              scrollbar: {
                horizontal: "hidden",
                vertical: "hidden",
                verticalHasArrows: false,
                useShadows: false,
              },
              tabSize: 2,
              dragAndDrop: true,
              lightbulb: {
                enabled: false
              }
            }'
          />
        </div>
        <div class='pa-3 d-flex'>
          <v-btn text depressed @click='editDialogOpen = false'>Cancel</v-btn>
          <v-spacer />
          <v-btn color='accent' depressed @click='saveEditedHeader'>
            <v-icon left>mdi-content-save-outline</v-icon>
            Save
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <div @dragenter.capture='onDragEnter' @dragleave.capture='onDragLeave' @dragover.capture.prevent @drop.capture.prevent.stop='onDrop'>
      <v-btn
        v-for='header in customHeaders'
        :key='header.id'
        class='text-none mr-1 mb-1'
        :color='customHeaderStates[header.id] ? "secondary" : "background lighten-2"'
        depressed
        @contextmenu.native='e => showContextMenu(e, header)'
        @click='customHeaderStates[header.id] = !customHeaderStates[header.id]'
      >
        {{ header.name }}
      </v-btn>

      <v-btn v-if='dragEnterCount > 0' outlined color='background lighten-4' class='text-none mr-1 mb-1'><em>Drop to add</em></v-btn>

      <v-btn
        class='text-none mr-1 mb-1'
        depressed
        color='accent'
        @click='editNewCustomHeader'
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>

      <div class='text-caption'>You can also drop header files here.</div>

      <v-menu
        v-model='contextMenuOpen'
        :position-x='contextMenuX'
        :position-y='contextMenuY'
        absolute
        offset-y
      >
        <v-list>
          <v-list-item @click='editHeader'>
            <v-icon left color='inherit'>mdi-pencil</v-icon>
            <v-list-item-title>Edit</v-list-item-title>
          </v-list-item>
          <v-list-item @click='insertHeader(contextMenuHeader)'>
            <v-icon left color='inherit'>mdi-content-duplicate</v-icon>
            <v-list-item-title>Dublicate</v-list-item-title>
          </v-list-item>
          <v-list-item @click='deleteHeader'>
            <v-icon left color='inherit'>mdi-delete</v-icon>
            <v-list-item-title>Delete</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </div>
</template>

<script>
  import { getDb } from '~/assets/db/database'
  import { insertCustomHeader } from '~/assets/lib/customHeader'
  import { saveCustomHeader } from '~/assets/lib/customHeader'

  export default {
    name: 'WotwSeedgenCustomHeaderSelect',
    props: {
      value: {
        type: Array,
        required: true,
      },
    },
    data: vm => ({
      customHeaderStates: {},
      inputValue: vm.value ?? [],
      contextMenuX: 0,
      contextMenuY: 0,
      contextMenuOpen: false,
      contextMenuHeader: null,
      editingHeaderId: null,
      editingHeaderName: '',
      editingHeaderContent: '',
      customHeaders: [],
      editDialogOpen: false,
      dragEnterCount: 0,
    }),
    watch: {
      customHeaderStates: {
        deep: true,
        handler(value) {
          this.inputValue = Object.keys(value).filter(
            p => !!this.customHeaderStates[p],
          )
        },
      },
      inputValue: {
        deep: true,
        handler(value) {
          this.$emit('input', value)
        },
      },
      value: {
        deep: true,
        handler(value) {
          this.inputValue = value
          this.updateStates()
        },
      },
    },
    async mounted() {
      (await getDb).on('changes', this.updateStates)
      await this.updateStates()
    },
    methods: {
      async updateStates() {
        this.customHeaders = await (await getDb).customHeaders.toArray()

        for (const header of this.customHeaders) {
          this.$set(this.customHeaderStates, header.id, this.inputValue.includes(header.id))
        }
      },
      showContextMenu(event, header) {
        event.preventDefault()
        this.editingHeaderId = header.id
        this.contextMenuX = event.clientX
        this.contextMenuY = event.clientY
        this.contextMenuOpen = true
        this.contextMenuHeader = header
        this.editingHeaderId = header.id
        this.editingHeaderName = header.name
        this.editingHeaderContent = header.content
      },
      editNewCustomHeader() {
        this.editingHeaderId = null
        this.editingHeaderName = ''
        this.editingHeaderContent = ''
        this.editDialogOpen = true
      },
      insertHeader(header){
        insertCustomHeader(header.name, header.content)
      },
      async saveEditedHeader() {
        await saveCustomHeader(this.editingHeaderId, this.editingHeaderName, this.editingHeaderContent)
        this.editDialogOpen = false
      },
      editHeader() {
        this.editDialogOpen = true
      },
      async deleteHeader() {
        await (await getDb).customHeaders.delete(this.editingHeaderId)
      },
      onDragEnter(event) {
        if (event.dataTransfer.types.includes('Files')) {
          this.dragEnterCount++
        }
      },
      onDragLeave() {
        if (this.dragEnterCount > 0) {
          this.dragEnterCount--
        }
      },
      async onDrop(event) {
        this.dragEnterCount = 0
        for (const file of event.dataTransfer.files) {
          await (await getDb).customHeaders.add({
            name: file.name.replace(/\.wotwrh$/, ''),
            content: await file.text()
          })
        }
      },
    },
  }
</script>

<style lang='scss' scoped>
  .relative {
    position: relative;

    .fill {
      width: 100%;
      height: 100%;
    }
  }
</style>
