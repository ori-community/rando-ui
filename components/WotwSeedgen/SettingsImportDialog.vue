<template>
  <v-card class="d-flex flex-column">
    <div class="pt-5 px-5 pb-2">
      <h3>{{ title }}</h3>
    </div>

    <textarea
      v-model="settingsText"
      no-resize
      autofocus
      clearable
      class="import-textarea flex-grow-1 pa-5"
      placeholder="Paste Settings here..."
    ></textarea>

    <div class="d-flex pa-5 buttons import-button-area">
      <input ref="presetUploadInput" type="file" accept=".txt" hidden @change="readCustomPresetFromFile" />
      <v-btn type="file" color="accent" depressed @click="selectFileForCustomPresetImport">Open from file</v-btn>

      <v-alert v-if="importShowError" dense type="error">{{ importErrorMessageText }}</v-alert>
      <div>
        <v-btn
          depressed
          text
          @click="
            settingsText = ''
            $emit('canceled')
          "
          >Cancel</v-btn
        >
        <v-btn color="accent" :disabled="!settingsText" depressed @click="importSettings">Import</v-btn>
      </div>
    </div>
  </v-card>
</template>

<script>
  export default {
    name: 'SettingsImportDialog',
    props: {
      title: {
        type: String,
        default: 'Import Settings',
      },
      nameMaxLength: {
        type: Number,
        default: 50,
      },
      descriptionMaxLength: {
        type: Number,
        default: 200,
      },
    },
    data: () => ({
      settingsText: '',
      importShowError: false,
      importErrorMessageText: '',
      importErrorMessageTimeout: null,
    }),
    methods: {
      selectFileForCustomPresetImport() {
        this.$refs.presetUploadInput.click()
      },
      readCustomPresetFromFile(event) {
        const [file] = event.target.files
        const reader = new FileReader()

        reader.addEventListener(
          'load',
          () => {
            // this will then display a text file
            this.settingsText = reader.result
          },
          false,
        )

        if (file) {
          reader.readAsText(file)
        }

        this.$refs.presetUploadInput.value = ''
      },
      importSettings() {
        let settingsToImport = null
        try {
          settingsToImport = JSON.parse(this.settingsText)

          if (!settingsToImport.name) {
            this.importSetError('Name has to be set')
            return
          }

          if (!settingsToImport.multiverseSettings) {
            this.importSetError('Configuration cannot be empty')
            return
          }

          if (settingsToImport.name.length > this.nameMaxLength) {
            this.importSetError(
              `Name of custom header is too long (${settingsToImport.name.length}/${this.nameMaxLength})`,
            )
            return
          }

          if (settingsToImport.description?.length > this.descriptionMaxLength) {
            this.importSetError(
              `Description of custom header is too long (${settingsToImport.description.length}/${this.descriptionMaxLength})`,
            )
            return
          }
        } catch (e) {
          this.importSetError(String(e))
          return
        }

        this.$emit('import-settings', settingsToImport)
      },
      importSetError(message) {
        if (this.importErrorMessageTimeout !== null) {
          clearTimeout(this.importErrorMessageTimeout)
        }

        this.importErrorMessageText = message
        this.importShowError = true

        this.importErrorMessageTimeout = setTimeout(() => {
          this.importShowError = false
        }, 5000)
      },
    },
  }
</script>

<style scoped>
  .import-textarea {
    background-color: rgba(255, 255, 255, 0.1);
    width: 100%;
    min-height: 100%;
    border: none;
    outline: none;
    resize: none;
    color: white;
    font-family: 'Fira Code', 'Consolas', monospace;
  }
  .import-button-area {
    min-height: 100px;
    justify-content: space-between;
  }
</style>
