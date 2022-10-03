<template>
  <div>
    <div v-for="(headers, category) in groupedVisibleHeaders" :key="category" class="mb-5">
      <h2 class="mb-2">{{ category }}</h2>

      <div class="headers-group">
        <v-tooltip v-for="header in headers" :key="header.name" top>
          <template #activator="{ on }">
            <wotw-seedgen-toggleable-button v-model="headerSelectedStates[header.name]" v-on="on">
              {{ header.displayName }}
            </wotw-seedgen-toggleable-button>
          </template>
          <span>{{ header.description }}</span>
        </v-tooltip>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import { hasModelObject } from '~/assets/lib/hasModelObject'

  export default {
    name: 'HeadersSelect',
    mixins: [hasModelObject],
    data: () => ({
      headerSelectedStates: {},
    }),
    computed: {
      ...mapState('seedgen', ['library', 'parsedHeaders']),
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

        // eslint-disable-next-line dot-notation
        groupedVisibleHeaders['Other'] = uncategorizedHeaders

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
          // Sync and prepare headerSelectedStates for all available headers

          for (const header of this.parsedHeaders) {
            if (!(header.name in this.headerSelectedStates)) {
              this.$set(this.headerSelectedStates, header.name, false)
            }
          }

          for (const headerName of Object.keys(this.headerSelectedStates)) {
            if (!(headerName in this.parsedHeaders)) {
              this.$delete(this.parsedHeaders, headerName)
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
        }
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
    },
  }
</script>

<style lang="scss" scoped>
  .headers-group {
    display: flex;
    flex-wrap: wrap;
    flex-grow: 0;
    gap: 0.4em;
  }
</style>
