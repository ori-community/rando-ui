<template>
  <v-row>
    <v-col v-for="(headers, category) in groupedVisibleHeaders" :key="category" cols="12" md="6" lg="4" xl="3">
      <h2 class="mb-2">{{ category }}</h2>

      <div class="headers-group">
        <v-tooltip v-for="header in headers" :key="header.name" top>
          <template #activator="{ on }">
            <wotw-seedgen-toggleable-button
              v-model="headerSelectedStates[header.name]"
              :description="header.description"
              v-on="on"
            >
              {{ header.displayName }}
              <template #append>
                <v-badge
                  v-if="Object.keys(header.parametersByIdentifier).length > 0"
                  overlap
                  offset-x="16"
                  color="accent lighten-1"
                  class="d-flex align-center mx-1"
                  :value="getModifiedHeaderParameterCount(header) > 0"
                  :content="getModifiedHeaderParameterCount(header)"
                >
                  <v-btn icon small class="px-2 min-width-0" @click="editHeaderParameters(header)">
                    <v-icon>mdi-tune</v-icon>
                  </v-btn>
                </v-badge>
              </template>
            </wotw-seedgen-toggleable-button>
          </template>
          <span>{{ header.description }}</span>
        </v-tooltip>
      </div>
    </v-col>

    <v-dialog v-model="headerParameterEditor.isOpen" max-width="600">
      <v-card v-if="!!headerParameterEditor.header" class="pa-5">
        <h3>{{ headerParameterEditor.header.displayName }}</h3>

        <template v-for="parameter in Object.values(headerParameterEditor.header.parametersByIdentifier)">
          <template v-if="parameter.parameter_type === ParameterType.String">
            <v-text-field
              :key="parameter.identifier"
              v-model="headerParameterStates[headerParameterEditor.header.name][parameter.identifier]"
              :label="capitalCase(parameter.identifier)"
              :hint="parameter.documentation"
              persistent-hint
            >
              <template #append>
                <v-btn
                  icon
                  :disabled="!isHeaderParameterModified(headerParameterEditor.header, parameter)"
                  @click="restoreDefaultHeaderParameterValue(headerParameterEditor.header, parameter)"
                >
                  <v-icon>mdi-arrow-u-left-top</v-icon>
                </v-btn>
              </template>
            </v-text-field>
          </template>
          <template
            v-else-if="
              parameter.parameter_type === ParameterType.Int || parameter.parameter_type === ParameterType.Float
            "
          >
            <v-text-field
              :key="parameter.identifier"
              v-model="headerParameterStates[headerParameterEditor.header.name][parameter.identifier]"
              type="number"
              :label="capitalCase(parameter.identifier)"
              :hint="parameter.documentation"
              :step="parameter.parameter_type === ParameterType.Float ? 0.1 : 1.0"
              persistent-hint
            >
              <template #append>
                <v-btn
                  icon
                  :disabled="!isHeaderParameterModified(headerParameterEditor.header, parameter)"
                  @click="restoreDefaultHeaderParameterValue(headerParameterEditor.header, parameter)"
                >
                  <v-icon>mdi-arrow-u-left-top</v-icon>
                </v-btn>
              </template>
            </v-text-field>
          </template>
          <template v-else-if="parameter.parameter_type === ParameterType.Bool">
            <v-checkbox
              :key="parameter.identifier"
              v-model="headerParameterStates[headerParameterEditor.header.name][parameter.identifier]"
              :label="capitalCase(parameter.identifier)"
              :hint="parameter.documentation"
              persistent-hint
            >
              <template #append>
                <v-btn
                  icon
                  :disabled="!isHeaderParameterModified(headerParameterEditor.header, parameter)"
                  @click="restoreDefaultHeaderParameterValue(headerParameterEditor.header, parameter)"
                >
                  <v-icon>mdi-arrow-u-left-top</v-icon>
                </v-btn>
              </template>
            </v-checkbox>
          </template>
          <div v-else :key="parameter.identifier" class="py-4">
            Unknown parameter type <code>{{ parameter.parameter_type }}</code>
          </div>
        </template>

        <div class="d-flex">
          <v-spacer />
          <v-btn color="accent" depressed @click="headerParameterEditor.isOpen = false"> Done</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
  import { mapState } from 'vuex'
  import { capitalCase } from 'capital-case'
  import { hasModelObject } from '~/assets/lib/hasModelObject'
  import { hasOwnProperty } from '~/assets/lib/hasOwnProperty'

  export const ParameterType = Object.freeze({
    Bool: 0,
    Int: 1,
    Float: 2,
    String: 3,
  })

  export default {
    name: 'HeadersSelect',
    mixins: [hasModelObject],
    props: {
      headerConfig: {
        type: Array,
        default: () => [],
      },
    },
    data: () => ({
      headerSelectedStates: {},

      /**
       * {
       *   "some_header": {
       *     "some_parameter": "value",
       *   },
       *   ...
       * }
       */
      headerParameterStates: {},
      headerParameterEditor: {
        isOpen: false,
        header: null,
      },
    }),
    computed: {
      ParameterType: () => ParameterType,
      ...mapState('seedgen', ['library', 'parsedHeadersByName']),
      parsedHeaders() {
        return Object.values(this.parsedHeadersByName)
      },
      visibleHeaders() {
        return this.parsedHeaders.filter((h) => !h.hidden)
      },
      groupedVisibleHeaders() {
        const uncategorizedHeaders = this.visibleHeaders.filter((h) => !h.category)

        const groupedCategorizedHeaders = {}
        for (const header of this.visibleHeaders.filter((h) => !!h.category)) {
          if (!(header.category in groupedCategorizedHeaders)) {
            groupedCategorizedHeaders[header.category] = []
          }

          groupedCategorizedHeaders[header.category].push(header)
        }

        const predefinedCategoryOrder = [
          'Goals',
          'Hints',
          'Item Pool',
          'World Changes',
          'Quality of Life',
          'Placements',
        ]

        const groupedVisibleHeaders = {}

        // First add all predefined categories
        for (const category of predefinedCategoryOrder) {
          if (category in groupedCategorizedHeaders) {
            groupedVisibleHeaders[category] = groupedCategorizedHeaders[category]
            delete groupedCategorizedHeaders[category]
          }
        }

        // Then add all remaining categories
        for (const [category, headers] of Object.entries(groupedCategorizedHeaders)) {
          groupedVisibleHeaders[category] = headers
        }

        if (uncategorizedHeaders.length > 0) {
          // eslint-disable-next-line dot-notation
          groupedVisibleHeaders['Other'] = uncategorizedHeaders
        }

        // Sort headers in categories
        for (const headers of Object.values(groupedVisibleHeaders)) {
          headers.sort((a, b) => a.displayName.localeCompare(b.displayName))
        }

        return groupedVisibleHeaders
      },
    },
    watch: {
      parsedHeaders: {
        immediate: true,
        handler() {
          // Sync and prepare headerSelectedStates and headerParameterStates for all available headers
          for (const header of this.parsedHeaders) {
            if (!(header.name in this.headerSelectedStates)) {
              this.$set(this.headerSelectedStates, header.name, false)
            }
            if (!(header.name in this.headerParameterStates)) {
              this.$set(this.headerParameterStates, header.name, {})
            }
          }

          // Delete headers that don't exist anymore (including their parameters)
          for (const headerName of Object.keys(this.headerSelectedStates)) {
            if (!(headerName in this.parsedHeadersByName)) {
              this.$delete(this.headerSelectedStates, headerName)
            }
          }

          for (const headerName of Object.keys(this.headerParameterStates)) {
            if (!(headerName in this.parsedHeadersByName)) {
              this.$delete(this.headerParameterStates, headerName)
            }
          }

          // Add keys for header parameters to headerParameterStates
          for (const header of this.parsedHeaders) {
            for (const parameter of Object.values(header.parametersByIdentifier)) {
              if (!(parameter.identifier in this.headerParameterStates[header.name])) {
                this.$set(
                  this.headerParameterStates[header.name],
                  parameter.identifier,
                  this.getTypedValue(parameter.default_value, parameter.parameter_type),
                )
              }
            }
          }

          // Delete parameters that don't exist anymore
          for (const header of this.parsedHeaders) {
            for (const parameterIdentifier of Object.keys(this.headerParameterStates[header.name])) {
              if (!(parameterIdentifier in header.parametersByIdentifier)) {
                this.$delete(this.headerParameterStates[header.name], parameterIdentifier)
              }
            }
          }
        },
      },
      headerSelectedStates: {
        deep: true,
        handler(states) {
          const selectedHeaders = []

          for (const [headerName, selected] of Object.entries(states)) {
            if (selected) {
              selectedHeaders.push(headerName)
            }
          }

          this.model = selectedHeaders
        },
      },
      model: {
        immediate: true,
        handler(model) {
          for (const selectedHeader of model) {
            this.$set(this.headerSelectedStates, selectedHeader, true)
          }

          for (const currentlySelectedHeader of Object.entries(this.headerSelectedStates)
            .filter(([_, selected]) => selected)
            .map(([headerName, _]) => headerName)) {
            if (!model.includes(currentlySelectedHeader)) {
              this.$set(this.headerSelectedStates, currentlySelectedHeader, false)
            }
          }
        },
      },
      headerConfig: {
        immediate: true,
        /**
         * @param {HeaderConfig[]} headerConfig
         */
        handler(headerConfig) {
          // We do it in the next tick to ensure
          // the watcher for parsedHeaders has run

          this.$nextTick(() => {
            const parameterValuesByParameterIdentifierByHeaderName = {}

            for (const config of headerConfig) {
              if (!(config.headerName in parameterValuesByParameterIdentifierByHeaderName)) {
                parameterValuesByParameterIdentifierByHeaderName[config.headerName] = {}
              }

              const parameter = this.parsedHeadersByName[config.headerName].parametersByIdentifier[config.configName]
              parameterValuesByParameterIdentifierByHeaderName[config.headerName][config.configName] =
                this.getTypedValue(config.configValue, parameter.parameter_type)
            }

            for (const header of this.parsedHeaders) {
              for (const parameter of Object.values(header.parametersByIdentifier)) {
                const existingValue =
                  parameterValuesByParameterIdentifierByHeaderName[header.name]?.[parameter.identifier]

                if (!hasOwnProperty(this.headerParameterStates, header.name)) {
                  this.$set(this.headerParameterStates, header.name, {})
                }

                this.$set(
                  this.headerParameterStates[header.name],
                  parameter.identifier,
                  this.getTypedValue(
                    existingValue !== undefined
                      ? existingValue
                      : parameter.default_value,
                    parameter.parameter_type,
                  ),
                )
              }
            }
          })
        },
      },
      headerParameterStates: {
        deep: true,
        handler(headerParameterStates) {
          const nonDefaultHeaderConfigs = []

          for (const headerName of Object.keys(headerParameterStates)) {
            for (const parameterIdentifier of Object.keys(headerParameterStates[headerName])) {
              const value = String(headerParameterStates[headerName][parameterIdentifier])
              const parameter = this.parsedHeadersByName[headerName].parametersByIdentifier[parameterIdentifier]

              if (value !== parameter.default_value) {
                nonDefaultHeaderConfigs.push({
                  headerName,
                  configName: parameterIdentifier,
                  configValue: value,
                })
              }
            }
          }

          this.$emit('update:headerConfig', nonDefaultHeaderConfigs)
        },
      },
    },
    methods: {
      capitalCase,
      getTypedValue(value, type) {
        switch (type) {
          case ParameterType.Int:
          case ParameterType.Float:
            return Number(value)
          case ParameterType.Bool:
            return value === 'true'
          default:
            return String(value)
        }
      },
      restoreDefaultHeaderParameterValue(header, parameter) {
        this.headerParameterStates[header.name][parameter.identifier] = this.getTypedValue(
          parameter.default_value,
          parameter.parameter_type,
        )
      },
      getModifiedHeaderParameterCount(header) {
        let count = 0
        for (const parameter of Object.values(header.parametersByIdentifier)) {
          if (this.isHeaderParameterModified(header, parameter)) {
            count++
          }
        }
        return count
      },
      isHeaderParameterModified(header, parameter) {
        return String(this.headerParameterStates[header.name]?.[parameter.identifier]) !== parameter.default_value
      },
      editHeaderParameters(header) {
        this.headerSelectedStates[header.name] = true
        this.headerParameterEditor.header = header
        this.headerParameterEditor.isOpen = true
      },
    },
  }
</script>

<style lang="scss" scoped>
  .headers-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4em;
  }

  .min-width-0 {
    min-width: 0 !important;
  }
</style>
