<template>
  <div>
    <v-tooltip
      v-for='(glitch, id) in glitches'
      :key='id'
      top
      :disabled='!glitch.description'
      open-delay='500'
    >
      <template #activator='{on}'>
        <v-btn
          :value='true'
          class='text-none mr-1 mb-1'
          :color='glitchStates[id] ? "secondary" : "background lighten-2"'
          depressed
          v-on='on'
          @click='glitchStates[id] = !glitchStates[id]'
        >
          {{ glitch.name }}
        </v-btn>
      </template>
      <span>{{ glitch.description }}</span>
    </v-tooltip>
  </div>
</template>

<script>
  export default {
    name: 'WotwSeedgenGlitchSelect',
    props: {
      glitches: {
        type: Object,
        required: true,
      },
      value: {
        type: Array,
        required: true,
      },
    },
    data: vm => ({
      glitchStates: {},
      inputValue: vm.value ?? [],
    }),
    watch: {
      glitchStates: {
        deep: true,
        handler(value) {
          this.inputValue = Object.keys(value).filter(p => !!this.glitchStates[p])
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
        for (const id of Object.keys(this.glitches)) {
          this.$set(this.glitchStates, id, this.inputValue.includes(id))
        }
      },
    },
  }
</script>

<style scoped>

</style>
