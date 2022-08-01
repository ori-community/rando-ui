<template>
  <div></div>
</template>

<script>
  import cloneDeep from 'lodash.clonedeep'

  export default {
    name: 'WotwSeedgenWorldSettings',
    props: {
      value: {
        type: Object,
        required: true,
      },
    },
    data: (vm) => ({
      modelReference: vm.value,
      model: cloneDeep(vm.value),
    }),
    watch: {
      value(newValue) {
        if (newValue !== this.modelReference) {
          this.modelReference = newValue
          this.model = cloneDeep(newValue)
        }
      },
    },
  }
</script>

<style scoped></style>
