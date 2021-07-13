<template>
  <div>
    <v-tooltip
      v-for='(logic, id) in logicSets'
      :key='id'
      top
      :disabled='!logic.description'
      open-delay='500'
    >
      <template #activator='{on}'>
        <v-btn
          :value='true'
          class='text-none mr-1 mb-1'
          :color='logicStates[id] ? "secondary" : "background lighten-2"'
          depressed
          v-on='on'
          @click='logicStates[id] = !logicStates[id]'
        >
          {{ logic.name }}
        </v-btn>
      </template>
      <span>{{ logic.description }}</span>
    </v-tooltip>
  </div>
</template>

<script>
  export default {
    name: 'WotwSeedgenLogicSelect',
    props: {
      logicSets: {
        type: Object,
        required: true,
      },
      value: {
        type: Array,
        required: true,
      },
    },
    data: vm => ({
      logicStates: {},
      inputValue: vm.value ?? [],
    }),
    watch: {
      logicStates: {
        deep: true,
        handler(value) {
          this.inputValue = Object.keys(value).filter(p => !!this.logicStates[p])
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
      },
    },
    created() {
      this.updateStates()
    },
    methods: {
      updateStates() {
        for (const id of Object.keys(this.logicSets)) {
          this.$set(this.logicStates, id, this.inputValue.includes(id))
        }
      },
    },
  }
</script>

<style scoped>

</style>
