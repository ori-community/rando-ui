<template>
  <div class="teleporters">
    <WotwTrackerViewTeleporter style="grid-column: 3; grid-row: 1" name="Wellspring" :active="trackedValues.tp_wellspring" />
    <WotwTrackerViewTeleporter style="grid-column: 5; grid-row: 1" name="Reach" :active="trackedValues.tp_baurs_reach" />
    <WotwTrackerViewTeleporter style="grid-column: 6; grid-row: 1" name="Shriek" :active="trackedValues.tp_willow_outer" />
    <WotwTrackerViewTeleporter style="grid-column: 1; grid-row: 2" name="Pools West" :active="trackedValues.tp_luma_pools_west" />
    <WotwTrackerViewTeleporter style="grid-column: 2; grid-row: 2" name="Pools East" :active="trackedValues.tp_luma_pools_east" />
    <WotwTrackerViewTeleporter style="grid-column: 4; grid-row: 2" name="Glades" :active="trackedValues.tp_wellspring_glades" />
    <WotwTrackerViewTeleporter style="grid-column: 6; grid-row: 2" name="Willow" :active="trackedValues.tp_willow_inner" />
    <WotwTrackerViewTeleporter style="grid-column: 8; grid-row: 2" name="Outer Ruins" :active="trackedValues.tp_windtorn_ruins_outer" />
    <WotwTrackerViewTeleporter style="grid-column: 3; grid-row: 3" name="Marsh" :active="trackedValues.tp_inkwater_marsh" />
    <WotwTrackerViewTeleporter style="grid-column: 4; grid-row: 3" name="Hollow" :active="trackedValues.tp_kwoloks_hollow" />
    <WotwTrackerViewTeleporter style="grid-column: 5; grid-row: 3" name="Woods West" :active="trackedValues.tp_silent_woods_west" />
    <WotwTrackerViewTeleporter style="grid-column: 6; grid-row: 3" name="Woods East" :active="trackedValues.tp_silent_woods_east" />
    <WotwTrackerViewTeleporter style="grid-column: 7; grid-row: 3" name="Wastes West" :active="trackedValues.tp_windswept_wastes_west" />
    <WotwTrackerViewTeleporter style="grid-column: 8; grid-row: 3" name="Wastes East" :active="trackedValues.tp_windswept_wastes_east" />
    <WotwTrackerViewTeleporter style="grid-column: 3; grid-row: 4" name="Burrows" :active="trackedValues.tp_midnight_burrows" />
    <WotwTrackerViewTeleporter style="grid-column: 4; grid-row: 4" name="Den" :active="trackedValues.tp_howls_den" />
    <WotwTrackerViewTeleporter style="grid-column: 5; grid-row: 4" name="Depths" :active="trackedValues.tp_mouldwood_depths" />
    <WotwTrackerViewTeleporter style="grid-column: 8; grid-row: 4" name="Inner Ruins" :active="trackedValues.tp_windtorn_ruins_inner" />
  </div>
</template>

<script>
  export default {
    name: 'TrackerTeleporters',
    layout: 'plain',
    props: {
      trackedValues: {
        type: Object,
        required: true,
      },
    },
  }
</script>

<style lang="scss" scoped>
  .teleporters {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    width: 100%;
    transition: opacity 200ms;

    > * {
      min-width: 0;
      min-height: 0;
    }
  }
</style>
