<template>
  <div>
    <v-card
      v-for='header in visibleHeaders'
      :key='header.headerName'
      class='d-inline-flex align-center mr-1 mb-1'
      color='background lighten-3'
      elevation='0'
    >
      <v-tooltip
        top
        :disabled='!header.description'
        max-width='300'
        open-delay='500'
      >
        <template #activator='{on}'>
          <v-btn
            :value='true'
            class='text-none'
            :color='headerStates[header.headerName] ? "secondary" : "background lighten-2"'
            depressed
            v-on='on'
            @click='toggleHeaderState(header)'
            @contextmenu.native='e => showContextMenu(e, header)'
          >
            {{ header.name }}
          </v-btn>
        </template>
        <span class='text-pre-wrap'>{{ header.description.join('\n') }}</span>
      </v-tooltip>

      <v-badge v-if='header.params.length > 0' overlap offset-x='16' :value='getModifiedHeaderArgCount(header) > 0' :content='getModifiedHeaderArgCount(header)' color='accent lighten-1'>
        <v-btn icon small class='mx-2' @click='editHeaderArgs(header)'>
          <v-icon>mdi-tune</v-icon>
        </v-btn>
      </v-badge>
    </v-card>

    <v-dialog v-model='headerArgEditor.isOpen' max-width='600'>
      <v-card v-if='!!headerArgEditor.header' class='pa-5'>
        <h3>Configure {{ headerArgEditor.header.name }}</h3>

        <template v-for='param in headerArgEditor.header.params'>
          <template v-if='param.type === "string"'>
            <v-text-field
              :key='param.name'
              v-model='headerArgStates[headerArgEditor.header.headerName][param.name]'
              :label='param.name'
              :hint='param.description.join(" ")'
              persistent-hint
            >
              <template #append>
                <v-btn
                  icon
                  :disabled='!isHeaderParamModified(headerArgEditor.header, param)'
                  @click='restoreDefaultHeaderParam(headerArgEditor.header, param)'
                >
                  <v-icon>mdi-arrow-u-left-top</v-icon>
                </v-btn>
              </template>
            </v-text-field>
          </template>
          <template v-else-if='param.type === "int"'>
            <v-text-field
              :key='param.name'
              v-model='headerArgStates[headerArgEditor.header.headerName][param.name]'
              type='number'
              :label='param.name'
              :hint='param.description.join(" ")'
              persistent-hint
            >
              <template #append>
                <v-btn
                  icon
                  :disabled='!isHeaderParamModified(headerArgEditor.header, param)'
                  @click='restoreDefaultHeaderParam(headerArgEditor.header, param)'
                >
                  <v-icon>mdi-arrow-u-left-top</v-icon>
                </v-btn>
              </template>
            </v-text-field>
          </template>
          <template v-else-if='param.type === "bool"'>
            <v-checkbox
              :key='param.name'
              v-model='headerArgStates[headerArgEditor.header.headerName][param.name]'
              :label='param.name'
              :hint='param.description.join(" ")'
              persistent-hint
            >
              <template #append>
                <v-btn
                  icon
                  :disabled='!isHeaderParamModified(headerArgEditor.header, param)'
                  @click='restoreDefaultHeaderParam(headerArgEditor.header, param)'
                >
                  <v-icon>mdi-arrow-u-left-top</v-icon>
                </v-btn>
              </template>
            </v-checkbox>
          </template>
        </template>

        <div class='d-flex'>
          <v-spacer />
          <v-btn color='accent' depressed @click='headerArgEditor.isOpen = false'>
            Done
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
    <v-menu
      v-model='contextMenuOpen'
      :position-x='contextMenuX'
      :position-y='contextMenuY'
      absolute
      offset-y
    >
      <v-list>
        <v-list-item v-if='contextMenuHeader && contextMenuHeader.params.length > 0' @click='editHeaderArgs(contextMenuHeader)'>
          <v-icon left color='inherit'>mdi-tune</v-icon>
          <v-list-item-title>Configure parameters</v-list-item-title>
        </v-list-item>
        <v-list-item @click='downloadToCustomHeaders(contextMenuHeader.headerName)'>
          <v-icon left color='inherit'>mdi-download</v-icon>
          <v-list-item-title>Copy to custom headers</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
  import { downloadHeaderToCustom } from '~/assets/lib/customHeader'

  export default {
    name: 'WotwSeedgenHeaderSelect',
    props: {
      headers: {
        type: Array,
        required: true,
      },
      value: {
        type: Array,
        required: true,
      },
      headerArgs: {
        type: Object,
        required: true,
      }
    },
    data: vm => ({
      headerStates: {},
      inputValue: vm.value ?? [],
      headerArgEditor: {
        isOpen: false,
        header: null,
      },
      headerArgStates: {},
      contextMenuHeader: null,
      contextMenuX: 0,
      contextMenuY: 0,
      contextMenuOpen: false,
    }),
    computed: {
      visibleHeaders() {
        return this.headers.filter(h => !h.hidden)
      },
    },
    watch: {
      headerArgs: {
        deep: true,
        handler() {
          this.updateArgStates()
        },
      },
      headerStates: {
        deep: true,
        handler(value) {
          this.inputValue = Object.keys(value).filter(p => !!this.headerStates[p])
        },
      },
      inputValue: {
        deep: true,
        handler(value) {
          this.$emit('input', value)
        },
      },
      headerArgStates: {
        deep: true,
        handler(headerArgStates) {
          console.info(headerArgStates)
          const headerArgs = {}
          for (const headerName of Object.keys(headerArgStates)) {
            if (this.headerStates[headerName]) {
              for (const paramName of Object.keys(headerArgStates[headerName])) {
                headerArgs[headerName + '.' + paramName] = String(headerArgStates[headerName][paramName])
              }
            }
          }

          if (
            Object.keys(headerArgs).length !== Object.keys(this.headerArgs).length ||
            Object.keys(headerArgs).some(arg => this.headerArgs[arg] !== headerArgs[arg])
          ) {
            this.$emit('update:headerArgs', headerArgs)
          }
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
    created() {
      this.updateStates()
      this.updateArgStates()
    },
    methods: {
      getTypedValue(value, type) {
        switch (type) {
          case 'int':
          case 'float': return Number(value)
          case 'bool': return value === 'true'
          default: return String(value)
        }
      },
      showContextMenu(event, header) {
        event.preventDefault()
        this.contextMenuHeader = header
        this.contextMenuX = event.clientX
        this.contextMenuY = event.clientY
        this.contextMenuOpen = true
      },
      toggleHeaderState(header) {
        this.headerStates[header.headerName] = !this.headerStates[header.headerName]
      },
      restoreDefaultHeaderParam(header, param) {
        this.headerArgStates[header.headerName][param.name] = this.getTypedValue(param.default, param.type)
      },
      getModifiedHeaderArgCount(header) {
        let count = 0
        for (const param of header.params) {
          if (this.isHeaderParamModified(header, param)) {
            count++
          }
        }
        return count
      },
      isHeaderParamModified(header, param) {
        return String(this.headerArgStates[header.headerName][param.name]) !== param.default
      },
      updateStates() {
        for (const header of this.headers) {
          this.$set(this.headerStates, header.headerName, this.inputValue.includes(header.headerName))
        }
      },
      updateArgStates() {
        for (const header of this.headers) {
          const headerArgState = {}
          for (const param of header.params) {
            headerArgState[param.name] = this.getTypedValue(this.headerArgs[header.headerName + '.' + param.name] ?? param.default, param.type)
          }
          this.$set(this.headerArgStates, header.headerName, headerArgState)
        }
      },
      editHeaderArgs(header) {
        this.headerStates[header.headerName] = true
        this.headerArgEditor.header = header
        this.headerArgEditor.isOpen = true
      },
      downloadToCustomHeaders(header) {
          downloadHeaderToCustom(header.headerName, header.name)
      },
    },
  }
</script>

<style scoped>

</style>
