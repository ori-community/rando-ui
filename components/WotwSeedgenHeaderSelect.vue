<template>
  <div>
    <v-card
      v-for='header in headers'
      :key='header.headerName'
      class='d-inline-flex align-center mr-1 mb-1'
      color='background lighten-3'
      elevation='0'
    >
      <v-tooltip
        top
        :disabled='!header.description'
        max-width='300'
        open-delay='500'
      >
        <template #activator='{on}'>
          <v-btn
            :value='true'
            class='text-none'
            :color='headerStates[header.headerName] ? "secondary" : "background lighten-2"'
            depressed
            v-on='on'
            @click='headerStates[header.headerName] = !headerStates[header.headerName]'
          >
            {{ header.name }}
          </v-btn>
        </template>
        <span class='text-pre-wrap'>{{ header.description.join('\n') }}</span>
      </v-tooltip>

<!--      <v-badge overlap offset-x='16' content='2' color='accent lighten-1'>-->
<!--        <v-btn icon small class='mx-2'>-->
<!--          <v-icon>mdi-tune</v-icon>-->
<!--        </v-btn>-->
<!--      </v-badge>-->
    </v-card>
  </div>
</template>

<script>
  export default {
    name: 'WotwSeedgenHeaderSelect',
    props: {
      headers: {
        type: Array,
        required: true,
      },
      value: {
        type: Array,
        required: true,
      },
    },
    data: vm => ({
      headerStates: {},
      inputValue: vm.value ?? [],
    }),
    watch: {
      headerStates: {
        deep: true,
        handler(value) {
          this.inputValue = Object.keys(value).filter(p => !!this.headerStates[p])
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
        for (const header of this.headers) {
          this.$set(this.headerStates, header.headerName, this.inputValue.includes(header.headerName))
        }
      },
    },
  }
</script>

<style scoped>

</style>
