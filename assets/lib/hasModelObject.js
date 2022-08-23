import cloneDeep from 'lodash.clonedeep'

export const hasModelObject = {
  props: {
    value: {
      type: Object | String | Number,
      required: true,
    },
  },
  data: (vm) => ({
    _modelReference: vm.value,
    _disableModelWatchTrigger: false,
    model: cloneDeep(vm.value),
  }),
  watch: {
    value: {
      deep: true,
      handler(newValue) {
        if (newValue !== this._modelReference) {
          this._modelReference = newValue
          this._disableModelWatchTrigger = true
          this.model = cloneDeep(newValue)

          this.$nextTick(() => {
            this._disableModelWatchTrigger = false
          })
        }
      },
    },
    model: {
      deep: true,
      handler(newModel) {
        if (this._disableModelWatchTrigger) {
          return
        }

        this.$emit('input', newModel)
      },
    },
  },
}
