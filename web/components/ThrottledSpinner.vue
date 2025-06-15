<template>
  <v-fade-transition mode="out-in">
    <div v-if="!!$slots.default" key="content">
      <slot/>
    </div>
    <div v-else-if="show" key="progress" class="text-center" :class="{'ma-8': !noMargin}">
      <v-progress-circular indeterminate v-bind="$attrs"/>
    </div>
  </v-fade-transition>
</template>

<script lang="ts" setup>
  const show = ref(false)

  withDefaults(defineProps<{
    noMargin: boolean,
  }>(), {
    noMargin: false,
  })

  onMounted(() => {
    setTimeout(() => show.value = true, 750)
  })
</script>

<style lang="scss" scoped>

</style>
