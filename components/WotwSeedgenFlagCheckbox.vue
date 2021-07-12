<template>
  <v-checkbox v-model='inputValue' v-bind='$attrs' />
</template>

<script>
  export default {
    name: 'WotwSeedgenFlagCheckbox',
    props: {
      value: {
        type: Array,
        required: true,
      },
      flag: {
        type: String,
        required: true,
      },
    },
    data: () => ({
      inputValue: false,
    }),
    watch: {
      value: {
        immediate: true,
        handler(value) {
          this.inputValue = value?.includes(this.flag)
        },
      },
      inputValue(value) {
        if (value && !this.value.includes(this.flag)) {
          this.$emit('input', this.value.concat(this.flag))
        } else if (!value && this.value.includes(this.flag)) {
          this.$emit('input', this.value.filter(f => f !== this.flag))
        }
      },
    },
  }
</script>

<style scoped>

</style>
