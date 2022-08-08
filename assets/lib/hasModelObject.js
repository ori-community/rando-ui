import cloneDeep from 'lodash.clonedeep'

export const hasModelObject = {
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
    value: {
      deep: true,
      handler(newValue) {
        if (newValue !== this.modelReference) {
          this.modelReference = newValue
          this.model = cloneDeep(newValue)
        }
      },
    },
    model: {
      deep: true,
      handler(newModel) {
        this.$emit('input', newModel)
      },
    },
  },
}
