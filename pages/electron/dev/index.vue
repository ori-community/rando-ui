<template>
  <div class="fill-height d-flex flex-column">
    <v-tabs v-model="tab" class="flex-shrink-1 flex-grow-0" height="28">
      <v-tab>Hierarchy</v-tab>
      <v-tab>Areas.wotw map</v-tab>
      <v-tab>TAS</v-tab>
      <v-tab>Uber State Log</v-tab>
    </v-tabs>

    <WotwDevtoolsTabHierarchy v-if="tab === 0" />
    <WotwDevtoolsTabAreasWotwMap v-else-if="tab === 1" />
    <WotwDevtoolsTabTAS v-else-if="tab === 2" />
    <WotwDevtoolsTabUberStateLog v-else-if="tab === 3" />
  </div>
</template>

<script>
  export default {
    layout: 'plain',
    data: () => ({
      tab: 1,
    }),
    head: {
      title: 'Client Devtools'
    },
  }
</script>

<style lang='scss' scoped>
  .tabs-no-background {
    &:deep(.v-tabs-items) {
      background-color: transparent !important;
      flex-grow: 1;
    }
  }
</style>
