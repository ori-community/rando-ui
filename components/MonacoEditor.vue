<template>
  <div ref='container'></div>
</template>

<script>
  import * as monaco from 'monaco-editor'
  import { uberStates } from '~/assets/seedgen/gameIds.yaml'

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

      monaco.languages.register({ id: 'ori-wotw-rando-header' })

      monaco.languages.setMonarchTokensProvider('ori-wotw-rando-header', {
        tokenizer: {
          root: [
            [/!![^ ]+/, 'header-command'],
            [/^!?[0-9]+\|[0-9=]+/, 'header-location'],
            [/([0-9]+\|)+[0-9=]+/, 'header-uber-id'],
            [/^.+:/, 'header-setting'],
            [/\/\/.*/, 'header-comment'],
            [/(bool|int|float|byte)/, 'header-type'],
            [/(true|false)/, 'header-bool'],
            [/\$(\([^)]*\)|\[[^\]]*]|WHEREIS|HOWMANY|PARAM)+/, 'header-function'],
            [/\$.+\$/, 'header-text-green'],
            [/\*.+\*/, 'header-text-blue'],
            [/@.+@/, 'header-text-red'],
            [/#.+#/, 'header-text-yellow'],
          ],
        },
      })

      monaco.languages.registerHoverProvider('ori-wotw-rando-header', {
        provideHover(model, position) {
          const line = model.getLineContent(position.lineNumber)
          const tokens = monaco.editor.tokenize(line, 'ori-wotw-rando-header')[0] // Line 0

          let hoverToken = null
          let previousToken = null
          let hoverTokenLength = null
          for (let index = 0; index < tokens.length; index++) {
            const token = tokens[index]

            if (previousToken === null) {
              previousToken = token
              continue
            }

            if (position.column <= token.offset) {
              hoverToken = previousToken

              if (index < tokens.length - 1) {
                hoverTokenLength = token.offset - hoverToken.offset
              } else {
                hoverTokenLength = model.getLineLength(position.lineNumber) - token.offset
              }

              break
            }

            previousToken = token
          }

          if (hoverToken) {
            const range = new monaco.Range(position.lineNumber, hoverToken.offset + 1, position.lineNumber, hoverToken.offset + 1 + hoverTokenLength)
            const tokenContent = model.getValueInRange(range)

            switch (hoverToken.type) {
              case 'header-location.ori-wotw-rando-header': {
                const match = tokenContent.match(/(?<groupId>[0-9]+)\|(?<uberId>[0-9=]+)/).groups
                const uberState = uberStates.find(s => String(s.uberId) === match.uberId && String(s.groupId) === match.groupId)

                if (uberState) {
                  let displayName = uberState.id

                  if (uberState.groupName && uberState.name) {
                    displayName += ` (${uberState.groupName}.${uberState.name})`
                  }

                  return {
                    range,
                    contents: [
                      { value: displayName },
                    ],
                  }
                }
              }
            }
          }

          return null
        },
      })

      monaco.languages.registerCompletionItemProvider('ori-wotw-rando-header', {
        provideCompletionItems(model, position) {
          // find out if we are completing a property in the 'dependencies' object.
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
          };
          return {
            suggestions: uberStates.map(s => ({
              label: s.id,
              kind: monaco.languages.CompletionItemKind.Constant,
              insertText: `${s.groupId}|${s.uberId}|`,
              range,
            }))
          };
        }
      });

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
          { token: 'header-function', foreground: '#ee8181' },
          { token: 'header-text-green', foreground: '#00ff00', fontStyle: 'bold' },
          { token: 'header-text-blue', foreground: '#77aaff', fontStyle: 'bold' },
          { token: 'header-text-red', foreground: '#ff2222', fontStyle: 'bold' },
          { token: 'header-text-yellow', foreground: '#ffa313', fontStyle: 'bold' },
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
