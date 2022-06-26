<template>
  <div>
    <v-card v-for="(goal, id) in goals" :key="id" class="d-inline-flex align-center mr-1" color="background lighten-3" elevation="0">
      <v-tooltip top :disabled="!goal.description" open-delay="500">
        <template #activator="{ on }">
          <v-btn
            :value="true"
            class="text-none"
            :color="goalStates[id] ? 'secondary' : 'background lighten-2'"
            depressed
            v-bind="$attrs"
            v-on="on"
            @click="goalSelected(id)"
          >
            {{ goal.name }} {{ id == 'RELICS' ? RelicsGoalButtonText() : '' }}
          </v-btn>
        </template>
        <span>{{ goal.description }}</span>
      </v-tooltip>
      <v-btn v-if="goal.parameters" icon small class="mx-2" @click="openOptionsDialog(id)">
        <v-icon>mdi-tune</v-icon>
      </v-btn>
    </v-card>

    <!-- Relics Options -->
    <v-dialog v-model="selectOptionsRelics" max-width="600">
      <v-card class="optionsDialog pa-4">
        <v-checkbox v-model="absoluteRelicCount" label="Specify relic count instead of chance" />
        <v-slider v-if="absoluteRelicCount" v-model="relicCount" hide-details min="1" max="11" :label="`${relicCount} relic${relicCount !== 1 ? 's' : ''}`" />
        <v-slider v-else v-model="relicChance" hide-details :label="`${relicChance}% relic chance (per area)`" />
      </v-card>
    </v-dialog>

    <!-- Bingo options -->
    <v-dialog v-model="selectOptionsBingo" max-width="500">
      <v-card class="optionsDialog pa-4">
        <v-item-group mandatory class="pb-6">
          <div>
            <v-tooltip v-for="bingoType in bingoTypes" :key="bingoType.id" top :disabled="!bingoType.description" open-delay="500">
              <template #activator="{ on }">
                <v-item v-slot="{ active, toggle }" @toggle="toggleBingoGoal(bingoType)">
                  <v-btn :value="true" class="mr-1 mb-1" :color="active ? 'secondary' : 'background lighten-2'" @click="toggle" v-on="on">
                    {{ bingoType.id }}
                  </v-btn>
                </v-item>
              </template>
              <span>{{ bingoType.description }}</span>
            </v-tooltip>
          </div>
        </v-item-group>
        <div class="pb-6">
          <v-slider v-model="bingoSize" :tick-labels="['1', '2', '3', '4', '5', '6', '7']" min="1" max="7" label="Board size" />
        </div>
        <div>
          <v-slider v-model="bingoLines" :thumb-size="24" thumb-label="always" min="1" :max="bingoSize * 2 + 2" label="Line count" />
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  export default {
    name: 'WotwSeedgenGoalSelect',
    props: {
      goals: {
        type: Object,
        required: true,
      },
      value: {
        type: Array,
        required: true,
      },
      bingoTypes: {
        type: Object,
        required: true,
      },
    },
    data: (vm) => ({
      goalStates: {},
      inputValue: vm.value ?? [],
      absoluteRelicCount: false,
      relicCount: 7,
      relicChance: 60,
      selectedBingo: null,
      bingoSize: 5,
      bingoLines: 3,
      selectOptionsRelics: false,
      selectOptionsBingo: false,
    }),
    watch: {
      goalStates: {
        deep: true,
        handler() {
          this.updateInputValue()
        },
      },
      absoluteRelicCount() {
        this.updateInputValue()
      },
      relicCount(value, old) {
        this.updateInputValue()
      },
      relicChance() {
        this.updateInputValue()
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
    created() {
      this.updateStates()
    },
    methods: {
      updateInputValue() {
        this.inputValue = Object.keys(this.goalStates)
          .filter((p) => !!this.goalStates[p])
          .map((goal) => {
            switch (goal) {
              case 'RELICS':
                return this.absoluteRelicCount ? 'RELICS:' + this.relicCount : 'RELICS:' + this.relicChance + '%'
            }

            return goal
          })
      },
      goalSelected(goalStateId) {
        this.goalStates[goalStateId] = !this.goalStates[goalStateId]
        this.$emit('goalSelected', goalStateId, this.goalStates[goalStateId])
      },
      openOptionsDialog(goalStateId) {
        this.goalStates[goalStateId] = true
        switch (goalStateId) {
          case 'RELICS':
            this.selectOptionsRelics = true
            break
          case 'BINGO':
            this.selectOptionsBingo = true
            break
        }
      },
      updateStates() {
        for (const id of Object.keys(this.goals)) {
          this.$set(this.goalStates, id, this.inputValue.map((g) => g.split(':')[0]).includes(id))

          if (id === 'RELICS') {
            const relicsGoalParams = this.RelicsGoalParams()

            if (relicsGoalParams) {
              this.absoluteRelicCount = !relicsGoalParams.endsWith('%')
              if (this.absoluteRelicCount) {
                this.relicCount = Number(relicsGoalParams)
              } else {
                this.relicChance = Number(relicsGoalParams.split('%')[0])
              }
            }
          }
        }
      },
      RelicsGoalButtonText() {
        const relicsGoalParams = this.RelicsGoalParams()
        if (relicsGoalParams) {
          return `(${relicsGoalParams})`
        }
        return ''
      },
      RelicsGoalParams() {
        const relicsGoalValue = this.inputValue.find((v) => v.split(':')[0] === 'RELICS')
        if (!relicsGoalValue) {
          return ''
        }
        return relicsGoalValue.split(':')[1]
      },
    },
  }
</script>

<style scoped>
  .optionsDialog {
    overflow: hidden;
  }
</style>
