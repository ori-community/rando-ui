<template>
  <div ref='container'></div>
</template>

<script>
  import * as monaco from 'monaco-editor'

  export default {
    name: 'MonacoEditor',
    props: {
      value: {
        type: String,
        required: true,
      },
      options: {
        type: Object,
        required: true,
      },
    },
    watch: {
      value(newValue) {
        if (this.editor) {
          const editor = this.editor
          if (newValue !== editor.getValue()) {
            editor.setValue(newValue)
          }
        }
      },
    },
    mounted() {
      const { value, options } = this

      monaco.languages.register({ id: 'ori-wotw-rando-header' });

      monaco.languages.setMonarchTokensProvider('ori-wotw-rando-header', {
        tokenizer: {
          root: [
            [/!![^ ]+/, 'header-command'],
            [/^[0-9]+\|[0-9]+/, 'header-location'],
            [/(?=^.+\|.+\|)[0-9]+\|[0-9]+/, 'header-uber-id'],
            [/.+:/, 'header-setting'],
            [/\/\/.*/, 'header-comment'],
            [/(bool|int|float)/, 'header-type'],
            [/(true|false)/, 'header-bool'],
            [/\$[^ ]+/, 'header-hints'],
          ],
        },
      })

      monaco.editor.defineTheme('ori-wotw-rando', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'header-location', foreground: '#ff7b00' },
          { token: 'header-uber-id', foreground: '#34a425' },
          { token: 'header-command', foreground: '#ffe015' },
          { token: 'header-setting', foreground: '#ff15bd' },
          { token: 'header-comment', foreground: '#7f7f7f' },
          { token: 'header-type', foreground: '#48a5e8' },
          { token: 'header-bool', foreground: '#48d3e8' },
          { token: 'header-hints', foreground: '#ff5656' },
        ],
      })

      this.editor = monaco.editor.create(this.$refs.container, {
        value,
        ...options,
      })
      this.editor.onDidChangeModelContent(event => {
        const value = this.editor.getValue()
        if (this.value !== value) {
          this.$emit('input', value, event)
        }
      })
    },
  }
</script>

<style scoped>

</style>
