<template>
  <div class="teleporters">
    <WotwTrackerViewTeleporter style="grid-column: 3; grid-row: 1" name="Wellspring" :active="trackedValues.tp_wellspring > 0" />
    <WotwTrackerViewTeleporter style="grid-column: 5; grid-row: 1" name="Reach" :active="trackedValues.tp_baurs_reach > 0" />
    <WotwTrackerViewTeleporter style="grid-column: 6; grid-row: 1" name="Shriek" :active="trackedValues.tp_willow_outer > 0" />
    <WotwTrackerViewTeleporter style="grid-column: 1; grid-row: 2" name="Pools West" :active="trackedValues.tp_luma_pools_west > 0" />
    <WotwTrackerViewTeleporter style="grid-column: 2; grid-row: 2" name="Pools East" :active="trackedValues.tp_luma_pools_east > 0" />
    <WotwTrackerViewTeleporter style="grid-column: 4; grid-row: 2" name="Glades" :active="trackedValues.tp_wellspring_glades > 0" />
    <WotwTrackerViewTeleporter style="grid-column: 6; grid-row: 2" name="Willow" :active="trackedValues.tp_willow_inner > 0" />
    <WotwTrackerViewTeleporter style="grid-column: 8; grid-row: 2" name="Outer Ruins" :active="trackedValues.tp_windtorn_ruins_outer > 0" />
    <WotwTrackerViewTeleporter style="grid-column: 3; grid-row: 3" name="Marsh" :active="trackedValues.tp_inkwater_marsh > 0" />
    <WotwTrackerViewTeleporter style="grid-column: 4; grid-row: 3" name="Hollow" :active="trackedValues.tp_kwoloks_hollow > 0" />
    <WotwTrackerViewTeleporter style="grid-column: 5; grid-row: 3" name="Woods West" :active="trackedValues.tp_silent_woods_west > 0" />
    <WotwTrackerViewTeleporter style="grid-column: 6; grid-row: 3" name="Woods East" :active="trackedValues.tp_silent_woods_east > 0" />
    <WotwTrackerViewTeleporter style="grid-column: 7; grid-row: 3" name="Wastes West" :active="trackedValues.tp_windswept_wastes_west > 0" />
    <WotwTrackerViewTeleporter style="grid-column: 8; grid-row: 3" name="Wastes East" :active="trackedValues.tp_windswept_wastes_east > 0" />
    <WotwTrackerViewTeleporter style="grid-column: 3; grid-row: 4" name="Burrows" :active="trackedValues.tp_midnight_burrows > 0" />
    <WotwTrackerViewTeleporter style="grid-column: 4; grid-row: 4" name="Den" :active="trackedValues.tp_howls_den > 0" />
    <WotwTrackerViewTeleporter style="grid-column: 5; grid-row: 4" name="Depths" :active="trackedValues.tp_mouldwood_depths > 0" />
    <WotwTrackerViewTeleporter style="grid-column: 8; grid-row: 4" name="Inner Ruins" :active="trackedValues.tp_windtorn_ruins_inner > 0" />
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
