<template>
  <div>
    <div class="d-flex">
      <h2 class="mb-2">General</h2>
      <v-spacer />
      <v-btn depressed text small @click="randomizeSettings()">
        <v-icon left>mdi-shuffle</v-icon>
        Randomize everything
      </v-btn>
    </div>

    <v-row>
      <v-col cols="12" md="6">
        <v-select
          v-model="model.spawn"
          :items="availableSpawns"
          label="Spawn"
          item-value="id"
          item-text="name"
          :prepend-icon="availableSpawns.find((s) => s.id === model.spawn).icon ?? 'mdi-map-marker-outline'"
        >
          <template #item="{ item }">
            <v-icon left>{{ item.icon ?? 'mdi-map-marker-outline' }}</v-icon>
            <span>{{ item.name }}</span>
          </template>
        </v-select>
      </v-col>
      <v-col cols="12" md="6">
        <v-select
          v-model="model.difficulty"
          :items="availableDifficulties"
          item-value="id"
          item-text="name"
          label="Difficulty"
          prepend-icon="mdi-gauge"
          hide-details
        >
          <template #item="{ item }">
            <div>
              <v-list-item-title>{{ item.name }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ item.description }}
              </v-list-item-subtitle>
            </div>
          </template>
        </v-select>
        <v-checkbox v-model="model.hard" label="Play on Hard mode" />
      </v-col>
      <v-col cols="12">
        <div class="d-flex align-center">
          <v-select
            v-model="model.tricks"
            :items="availableTricks"
            item-value="id"
            item-text="name"
            label="Tricks"
            prepend-icon="mdi-transit-detour"
            multiple
            chips
            deletable-chips
            small-chips
            placeholder="None"
            persistent-placeholder
          >
            <template #item="{ item }">
              <div>
                <v-list-item-title>{{ item.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ item.description }}
                </v-list-item-subtitle>
              </div>
            </template>
          </v-select>

          <v-btn text small @click="selectAllOrNoTricks">Select {{ allTricksSelected ? 'None' : 'All' }}</v-btn>
        </div>
      </v-col>

      <v-col cols="12">
        <wotw-seedgen-headers-select v-model="model.headers" :header-config.sync="model.headerConfig" />
      </v-col>

      <v-col cols="12" class="d-flex justify-end">
        <v-btn small text @click="inlineHeaderDialogOpen = true">
          <v-icon left>mdi-code-tags</v-icon>
          {{ inlineHeader.length > 0 ? 'Edit' : 'Add' }} custom header
        </v-btn>
      </v-col>

      <v-dialog v-model="inlineHeaderDialogOpen" fullscreen>
        <v-card class="d-flex flex-column">
          <div class="pt-5 px-5 pb-2">
            <h3>Custom header</h3>
          </div>

          <textarea
            v-model="inlineHeader"
            autofocus
            class="inline-header pa-5 flex-grow-1"
            placeholder="Write your custom header here..."
          ></textarea>

          <div class="d-flex pa-5">
            <v-spacer />
            <v-btn color="accent" depressed @click="inlineHeaderDialogOpen = false"> Done</v-btn>
          </div>
        </v-card>
      </v-dialog>
    </v-row>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import { ParameterType } from './HeadersSelect'
  import { hasModelObject } from '~/assets/lib/hasModelObject'
  import spawns from '~/assets/seedgen/spawns.yaml'
  import difficulties from '~/assets/seedgen/difficulties.yaml'
  import tricks from '~/assets/seedgen/tricks.yaml'
  import { mapKeys } from '~/assets/lib/mapKeys'

  export default {
    name: 'WotwSeedgenWorldSettings',
    mixins: [hasModelObject],
    data: () => ({
      presetSelectDone: false,
      inlineHeader: '',
      inlineHeaderDialogOpen: false,
    }),
    computed: {
      ...mapState('seedgen', ['library', 'parsedHeadersByName']),
      availableSpawns() {
        const availableSpawns = [
          {
            name: 'Random Teleporter',
            id: 'Random',
            icon: 'mdi-map-marker-question-outline',
          },
          {
            name: 'Random Position (Beta)',
            id: 'FullyRandom',
            icon: 'mdi-shuffle',
          },
        ]

        availableSpawns.push(...mapKeys(spawns))

        return availableSpawns
      },
      availableDifficulties() {
        return mapKeys(difficulties)
      },
      availableTricks() {
        return mapKeys(tricks)
      },
      allTricksSelected() {
        return this.model.tricks.length >= this.availableTricks.length
      },
    },
    watch: {
      'model.inlineHeaders': {
        deep: true,
        immediate: true,
        handler(inlineHeaders) {
          if (inlineHeaders.length === 0 && this.inlineHeader.length > 0) {
            this.inlineHeader = ''
          } else if (this.inlineHeader !== inlineHeaders[0]?.content) {
            this.inlineHeader = inlineHeaders[0]?.content ?? ''
          }
        },
      },
      inlineHeader(value) {
        if (this.model.inlineHeaders.length === 0 && value.length > 0) {
          this.model.inlineHeaders.push({
            content: value,
            name: 'custom_header',
          })
        } else if (this.model.inlineHeaders.length > 0 && value.length === 0) {
          this.model.inlineHeaders = []
        } else if (value.length > 0 && this.model.inlineHeaders[0].content !== value) {
          this.model.inlineHeaders[0].content = value
        }
      },
    },
    methods: {
      selectAllOrNoTricks() {
        if (this.allTricksSelected) {
          this.model.tricks = []
        } else {
          this.model.tricks = this.availableTricks.map((t) => t.id)
        }
      },
      randomizeSettings() {
        this.model.spawn = this.availableSpawns[Math.floor(Math.random() * this.availableSpawns.length)].id
        this.model.difficulty =
          this.availableDifficulties[Math.floor(Math.random() * this.availableDifficulties.length)].id
        this.model.hard = Math.random() >= 0.75

        this.model.tricks = []
        for (const trick of this.availableTricks) {
          if (Math.random() >= 0.5) {
            this.model.tricks.push(trick.id)
          }
        }

        this.model.headers = []
        this.model.headerConfig = []
        for (const header of Object.values(this.parsedHeadersByName)) {
          if (header.hidden) {
            continue
          }

          if (Math.random() >= 0.5) {
            this.model.headers.push(header.name)

            for (const parameter of Object.values(header.parametersByIdentifier)) {
              if (parameter.parameter_type === ParameterType.Bool) {
                const randomValue = Math.random() >= 0.5

                if (randomValue !== (parameter.default_value === 'true')) {
                  this.model.headerConfig.push({
                    headerName: header.name,
                    configName: parameter.identifier,
                    configValue: randomValue ? 'true' : 'false',
                  })
                }
              }
            }
          }
        }
      },
    },
  }
</script>

<style lang="scss" scoped>
  .inline-header {
    background-color: rgba(255, 255, 255, 0.1);
    width: 100%;
    min-height: 100%;
    border: none;
    outline: none;
    resize: vertical;
    color: white;
    font-family: 'Fira Code', 'Consolas', monospace;
  }
</style>
