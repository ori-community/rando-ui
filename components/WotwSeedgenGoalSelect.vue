<template>
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
    }),
    watch: {
      goalStates: {
        deep: true,
        handler(value) {
          this.inputValue = Object.keys(value).filter(p => !!this.goalStates[p])
        },
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
      updateStates() {
        for (const id of Object.keys(this.goals)) {
          this.$set(this.goalStates, id, this.inputValue.includes(id))
        }
      },
    },
  }
</script>

<style scoped>

</style>
