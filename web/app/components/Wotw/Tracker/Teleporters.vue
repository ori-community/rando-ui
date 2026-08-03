<template>
  <div class="teleporters">
    <WotwTrackerViewTeleporter
      style="grid-column: 3; grid-row: 1" name="Wellspring"
      :active="trackedValues.tpWellspring > 0"/>
    <WotwTrackerViewTeleporter
      style="grid-column: 5; grid-row: 1" name="Reach"
      :active="trackedValues.tpBaursReach > 0"/>
    <WotwTrackerViewTeleporter
      style="grid-column: 6; grid-row: 1" name="Shriek"
      :active="trackedValues.tpWillowOuter > 0"/>
    <WotwTrackerViewTeleporter
      style="grid-column: 1; grid-row: 2" name="Luma Boss"
      :active="trackedValues.tpLumaPoolsWest > 0"/>
    <WotwTrackerViewTeleporter
      style="grid-column: 2; grid-row: 2" name="Central Luma"
      :active="trackedValues.tpLumaPoolsEast > 0"/>
    <WotwTrackerViewTeleporter
      style="grid-column: 4; grid-row: 2" name="Glades"
      :active="trackedValues.tpWellspringGlades > 0"/>
    <WotwTrackerViewTeleporter
      style="grid-column: 6; grid-row: 2" name="Willow"
      :active="trackedValues.tpWillowInner > 0"/>
    <WotwTrackerViewTeleporter
      style="grid-column: 8; grid-row: 2" name="Outer Ruins"
      :active="trackedValues.tpWindtornRuinsOuter > 0"/>
    <WotwTrackerViewTeleporter
      style="grid-column: 3; grid-row: 3" name="Inkwater"
      :active="trackedValues.tpInkwaterMarsh > 0"/>
    <WotwTrackerViewTeleporter
      style="grid-column: 4; grid-row: 3" name="Hollow"
      :active="trackedValues.tpKwoloksHollow > 0"/>
    <WotwTrackerViewTeleporter
      style="grid-column: 5; grid-row: 3" name="Woods Entrance"
      :active="trackedValues.tpSilentWoodsWest > 0"/>
    <WotwTrackerViewTeleporter
      style="grid-column: 6; grid-row: 3" name="Woods Exit"
      :active="trackedValues.tpSilentWoodsEast > 0"/>
    <WotwTrackerViewTeleporter
      style="grid-column: 7; grid-row: 3" name="Feeding Grounds"
      :active="trackedValues.tpWindsweptWastesWest > 0"/>
    <WotwTrackerViewTeleporter
      style="grid-column: 8; grid-row: 3" name="Central Wastes"
      :active="trackedValues.tpWindsweptWastesEast > 0"/>
    <WotwTrackerViewTeleporter
      style="grid-column: 3; grid-row: 4" name="Burrows"
      :active="trackedValues.tpMidnightBurrows > 0"/>
    <WotwTrackerViewTeleporter
      style="grid-column: 4; grid-row: 4" name="Den" :active="trackedValues.tpHowlsDen > 0"/>
    <WotwTrackerViewTeleporter
      style="grid-column: 5; grid-row: 4" name="Depths"
      :active="trackedValues.tpMouldwoodDepths > 0"/>
    <WotwTrackerViewTeleporter
      style="grid-column: 8; grid-row: 4" name="Inner Ruins"
      :active="trackedValues.tpWindtornRuinsInner > 0"/>
  </div>
</template>

<script setup lang="ts">

  defineProps<{
    trackedValues: { [key: string]: number }
  }>()

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
