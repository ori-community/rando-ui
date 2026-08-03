<template>
  <div class="skills pa-1">
    <wotw-tracker-view-skill
      skill="spike" :bonus-melting-acquired="(trackedValues.meltingSpike ?? 0) > 0"
      :acquired="(trackedValues.skillSpike ?? 0) > 0"
    />
    <wotw-tracker-view-skill skill="sentry" :acquired="(trackedValues.skillSentry ?? 0) > 0" />
    <wotw-tracker-view-skill
      skill="blaze" :bonus-melting-acquired="(trackedValues.meltingBlaze ?? 0) > 0"
      :acquired="(trackedValues.skillBlaze ?? 0) > 0"
    />
    <wotw-tracker-view-skill skill="flap" :acquired="(trackedValues.skillFlap ?? 0) > 0" />
    <wotw-tracker-view-skill
      class="clean-water"
      skill="clean_water"
      :acquired="(trackedValues.skillCleanWater ?? 0) > 0"
    />
    <wotw-tracker-view-resource-timer
      class="resource-timer-view"
      :game-finished="(trackedValues.gameFinished ?? 0) > 0"
      :spirit-light="(trackedValues.resourceSpiritLight ?? 0)"
      :gorlek-ore="(trackedValues.resourceGorlekOre ?? 0)"
      :gorlek-ore-collected="(trackedValues.resourceGorlekOreCollected ?? 0)"
      :keystones="(trackedValues.resourceKeystones ?? 0)"
      :show-willow-hearts="showWillowHearts"
      :trees-required="(trackedValues.treesRequired ?? 0)"
      :wisps-required="(trackedValues.wispsRequired ?? 0)"
      :quests-required="(trackedValues.questsRequired ?? 0)"
      :relics-required="(trackedValues.relicsRequired ?? 0)"
      :hearts-required="8"
      :trees-count="(trackedValues.treesCount ?? 0)"
      :wisps-count="(trackedValues.wispsCount ?? 0)"
      :quests-count="(trackedValues.questsCount ?? 0)"
      :relics-count="(trackedValues.relicsCount ?? 0)"
      :hearts-count="heartCount"
      :glades-rebuild-projects-done="gladesRebuildProjectsDone"
      :current-area-has-uncollected-relic="(trackedValues.relicCurrentAreaUncollected ?? 0) > 0"
      :show-timer="showTimer"
      :time="time"
      :show-visited-entrances="(trackedValues.showVisitedEntranceCount ?? 0) > 0"
      :visited-entrance-count="visitedEntranceCount"
      :total-entrance-count="32"
    />
    <wotw-tracker-view-skill
      skill="hammer" :bonus-melting-acquired="(trackedValues.meltingHammer ?? 0) > 0"
      :acquired="(trackedValues.skillHammer ?? 0) > 0"
    />
    <wotw-tracker-view-skill
      skill="shuriken" :bonus-melting-acquired="(trackedValues.meltingShuriken ?? 0) > 0"
      :acquired="(trackedValues.skillShuriken ?? 0) > 0"
    />
    <wotw-tracker-view-skill skill="water_breath" :acquired="(trackedValues.skillWaterBreath ?? 0) > 0" />
    <wotw-tracker-view-skill skill="glide" :acquired="(trackedValues.skillGlide ?? 0) > 0" />

    <wotw-tracker-view-skill
      skill="sword" :tree-acquired="(trackedValues.treeSword ?? 0) > 0"
      :bonus-melting-acquired="(trackedValues.meltingSword ?? 0) > 0"
      :acquired="(trackedValues.skillSword ?? 0) > 0"
    />
    <wotw-tracker-view-skill
      skill="bow" :bonus-melting-acquired="(trackedValues.meltingBow ?? 0) > 0"
      :tree-acquired="(trackedValues.treeBow ?? 0) > 0" :acquired="(trackedValues.skillBow ?? 0) > 0"
    />
    <wotw-tracker-view-skill
      skill="bash" :tree-acquired="(trackedValues.treeBash ?? 0) > 0"
      :acquired="(trackedValues.skillBash ?? 0) > 0"
    />
    <wotw-tracker-view-skill
      skill="dash" :tree-acquired="(trackedValues.treeDash ?? 0) > 0"
      :acquired="(trackedValues.skillDash ?? 0) > 0"
    />
    <wotw-tracker-view-skill
      skill="water_dash" :tree-acquired="(trackedValues.treeWaterDash ?? 0) > 0"
      :acquired="(trackedValues.skillWaterDash ?? 0) > 0"
    />
    <wotw-tracker-view-skill
      skill="burrow" :tree-acquired="(trackedValues.treeBurrow ?? 0) > 0"
      :acquired="(trackedValues.skillBurrow ?? 0) > 0"
    />
    <wotw-tracker-view-skill
      skill="ancestral_light_glades"
      :tree-acquired="(trackedValues.treeAncestralLightGlades ?? 0) > 0"
      :acquired="(trackedValues.skillAncestralLightGlades ?? 0) > 0"
    />
    <wotw-tracker-view-skill
      skill="double_jump" :tree-acquired="(trackedValues.treeDoubleJump ?? 0) > 0"
      :acquired="(trackedValues.skillDoubleJump ?? 0) > 0"
    />
    <wotw-tracker-view-skill
      skill="regenerate" :tree-acquired="(trackedValues.treeRegenerate ?? 0) > 0"
      :acquired="(trackedValues.skillRegenerate ?? 0) > 0"
    />
    <wotw-tracker-view-skill
      skill="grapple" :tree-acquired="(trackedValues.treeGrapple ?? 0) > 0"
      :acquired="(trackedValues.skillGrapple ?? 0) > 0"
    />
    <wotw-tracker-view-skill
      skill="launch" :tree-acquired="(trackedValues.treeLaunch ?? 0) > 0"
      :acquired="(trackedValues.skillLaunch ?? 0) > 0"
      :fragments-found="(trackedValues.launchFragmentsCount ?? 0)"
      :fragments-required="(trackedValues.launchFragmentsRequired ?? 0)"
    />
    <wotw-tracker-view-skill
      skill="flash" :tree-acquired="(trackedValues.treeFlash ?? 0) > 0"
      :acquired="(trackedValues.skillFlash ?? 0) > 0"
    />
    <wotw-tracker-view-skill
      skill="light_burst" :tree-acquired="(trackedValues.treeLightBurst ?? 0) > 0"
      :acquired="(trackedValues.skillLightBurst ?? 0) > 0"
    />
    <wotw-tracker-view-skill
      skill="ancestral_light_marsh" :tree-acquired="(trackedValues.treeAncestralLightMarsh ?? 0) > 0"
      :acquired="(trackedValues.skillAncestralLightMarsh ?? 0) > 0"
    />
  </div>
</template>

<script setup lang="ts">
  import type {TRACKED_UBER_STATES} from "@shared/itemTracker/trackedUberStates"

  // TODO tracking doors

  const props = withDefaults(defineProps<{
    seedTags: string[],
    trackedValues: { [key in typeof TRACKED_UBER_STATES[number]["trackingId"]]?: number },
    showWillowHearts?: boolean,
    heartCount?: number,
    visitedEntranceCount?: number,
    showTimer?: boolean,
    time?: number,
  }>(), {
    showWillowHearts: false,
    heartCount: 0,
    visitedEntranceCount: 0,
    showTimer: true,
    time: 0,
  })

  const gladesRebuildProjectsDone = computed(() => {
    const projects = [
      "builderProjectSpiritWell",
      "builderProjectHouses",
      "builderProjectRemoveThorns",
      "builderProjectHousesB",
      "builderProjectOpenCave",
      "builderProjectHousesC",
      "builderProjectBeautify",
    ] as const

    for (const project of projects) {
      if (!(props.trackedValues[project] ?? 0 >= 3)) {
        return false
      }
    }

    return true
  })

</script>
<style lang="scss" scoped>
  .skills {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    width: 100%;
    height: calc(4 / 7 * 100vw);
    transition: opacity 200ms;

    > * {
      min-width: 0;
      min-height: 0;
    }

    .clean-water {
      grid-column: 5;
      grid-row: 1 / span 2;
    }

    .resource-timer-view {
      grid-column: 6 / span 2;
      grid-row: 1 / span 2;
      position: relative;
    }
  }
</style>
