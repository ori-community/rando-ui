<template>
  <div>
    <wotw-seedgen-world-settings-preset-select v-model='model' />
  </div>
</template>

<script>
  import { hasModelObject } from '~/assets/lib/hasModelObject'

  export default {
    name: 'WotwSeedgenWorldSettings',
    mixins: [hasModelObject],
    data: () => ({
      presetSelectDone: false,
    }),
  }
</script>

<style scoped></style>
