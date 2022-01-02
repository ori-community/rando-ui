<template>
  <div>
    <div>
      <v-tooltip
        v-for='(goal, id) in goals'
        :key='id'
        top
        :disabled='!goal.description'
        open-delay='500'
      >
        <template #activator='{on}'>
          <v-btn
            :value='true'
            class='text-none mr-1 mb-1'
            :color='goalStates[id] ? "secondary" : "background lighten-2"'
            depressed
            v-bind='$attrs'
            v-on='on'
            @click='goalStates[id] = !goalStates[id]'
          >
            {{ goal.name }}
          </v-btn>
        </template>
        <span>{{ goal.description }}</span>
      </v-tooltip>
    </div>
    <v-expand-transition>
      <div v-if='!!goalStates["RELICS"]'>
        <div class='mt-4'>
          <v-checkbox
            v-model="absoluteRelicCount"
            label="Specify relic count instead of chance"
          />

          <v-slider
            v-if="absoluteRelicCount"
            v-model="relicCount"
            hide-details
            min="1"
            max="11"
            :label="`${relicCount} relics`"
          />
          <v-slider
            v-else
            v-model="relicChance"
            hide-details
            :label="`${relicChance}% relic chance (per area)`"
          />
        </div>
      </div>
    </v-expand-transition>
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
    },
    data: vm => ({
      goalStates: {},
      inputValue: vm.value ?? [],
      absoluteRelicCount: false,
      relicCount: 7,
      relicChance: 60,
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
      relicCount() {
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
      }
    },
    created() {
      this.updateStates()
    },
    methods: {
      updateInputValue() {
        this.inputValue = Object.keys(this.goalStates)
          .filter(p => !!this.goalStates[p])
          .map(goal => {
            switch (goal) {
              case 'RELICS':
                return this.absoluteRelicCount
                  ? 'RELICS:' + this.relicCount
                  : 'RELICS:' + this.relicChance + '%'
            }

            return goal
          })
      },
      updateStates() {
        for (const id of Object.keys(this.goals)) {
          this.$set(this.goalStates, id, this.inputValue.map(g => g.split(':')[0]).includes(id))

          if (id === 'RELICS') {
            const relicsGoalValue = this.inputValue.find(v => v.split(':')[0] === 'RELICS')
            const relicsGoalParams = relicsGoalValue.split(':')[1]

            if (relicsGoalParams) {
              this.absoluteRelicCount = !relicsGoalParams.endsWith('%')
              if (this.absoluteRelicCount) {
                this.relicsCount = Number(relicsGoalParams)
              } else {
                this.relicsChance = Number(relicsGoalParams.split('%')[0])
              }
            }
          }
        }
      },
    },
  }
</script>

<style scoped>

</style>
