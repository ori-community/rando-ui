<template>
  <div>
    <v-row>
      <v-col cols="12" md="6">
        <v-select
          v-model="model.spawn"
          :items="availableSpawns"
          label="Spawn"
          item-value="id"
          item-text="name"
          :prepend-icon="
            availableSpawns.find((s) => s.id === model.spawn).icon ??
            'mdi-map-marker-outline'
          "
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

          <v-btn
            text
            small
            @click="selectAllOrNoTricks"
          >
            Select {{ allTricksSelected ? 'None' : 'All' }}
          </v-btn>
        </div>
      </v-col>

      <v-col cols="12">
        <wotw-seedgen-headers-select v-model="model.headers" />
      </v-col>
    </v-row>
  </div>
</template>

<script>
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
    }),
    computed: {
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
    methods: {
      selectAllOrNoTricks() {
        if (this.allTricksSelected) {
          this.model.tricks = []
        } else {
          this.model.tricks = this.availableTricks.map((t) => t.id)
        }
      },
    },
  }
</script>

<style scoped></style>
