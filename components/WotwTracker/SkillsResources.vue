<template>
  <div class="skills pa-1">
    <WotwTrackerViewSkill skill="spike" :bonus-melting-acquired="trackedValues.melting_spike > 0" :acquired="trackedValues.skill_spike > 0" />
    <WotwTrackerViewSkill skill="sentry" :acquired="trackedValues.skill_sentry > 0" />
    <WotwTrackerViewSkill skill="blaze" :bonus-melting-acquired="trackedValues.melting_blaze > 0" :acquired="trackedValues.skill_blaze > 0" />
    <WotwTrackerViewSkill skill="flap" :acquired="trackedValues.skill_flap > 0" />
    <WotwTrackerViewSkill class="clean-water" skill="clean_water" :acquired="trackedValues.skill_clean_water > 0" />
    <WotwTrackerViewResource
      class="resource-view"
      :game-finished="trackedValues.game_finished > 0"
      :flags="seedFlags"
      :spirit-light="trackedValues.resource_spirit_light"
      :gorlek-ore="trackedValues.resource_gorlek_ore"
      :gorlek-ore-collected="trackedValues.resource_gorlek_ore_collected"
      :keystones="trackedValues.resource_keystones"
      :show-willow-hearts="showWillowHearts"
      :total-tree-count="14"
      :total-wisp-count="5"
      :total-quest-count="17"
      :total-relic-count="trackedValues.relic_count_total"
      :total-heart-count="8"
      :tree-count="trackedValues.tree_count"
      :wisp-count="trackedValues.wisp_count"
      :quest-count="trackedValues.quest_count"
      :relic-count="trackedValues.relic_count"
      :heart-count="heartCount"
      :quest-rebuild-glades-done="trackedValues.quest_rebuild_glades > 1"
    />
    <WotwTrackerViewSkill skill="hammer" :bonus-melting-acquired="trackedValues.melting_hammer > 0" :acquired="trackedValues.skill_hammer > 0" />
    <WotwTrackerViewSkill skill="shuriken" :bonus-melting-acquired="trackedValues.melting_shuriken > 0" :acquired="trackedValues.skill_shuriken > 0" />
    <WotwTrackerViewSkill skill="water_breath" :acquired="trackedValues.skill_water_breath > 0" />
    <WotwTrackerViewSkill skill="glide" :acquired="trackedValues.skill_glide > 0" />

    <WotwTrackerViewSkill skill="sword" :tree-acquired="trackedValues.tree_sword > 0" :bonus-melting-acquired="trackedValues.melting_sword > 0" :acquired="trackedValues.skill_sword > 0" />
    <WotwTrackerViewSkill skill="bow" :bonus-melting-acquired="trackedValues.melting_bow > 0" :tree-acquired="trackedValues.tree_bow > 0" :acquired="trackedValues.skill_bow > 0" />
    <WotwTrackerViewSkill skill="bash" :tree-acquired="trackedValues.tree_bash > 0" :acquired="trackedValues.skill_bash > 0" />
    <WotwTrackerViewSkill skill="dash" :tree-acquired="trackedValues.tree_dash > 0" :acquired="trackedValues.skill_dash > 0" />
    <WotwTrackerViewSkill skill="water_dash" :tree-acquired="trackedValues.tree_water_dash > 0" :acquired="trackedValues.skill_water_dash > 0" />
    <WotwTrackerViewSkill skill="burrow" :tree-acquired="trackedValues.tree_burrow > 0" :acquired="trackedValues.skill_burrow > 0" />
    <WotwTrackerViewSkill
      skill="ancestral_light_glades"
      :tree-acquired="trackedValues.tree_ancestral_light_glades > 0"
      :acquired="trackedValues.skill_ancestral_light_glades > 0"
    />
    <WotwTrackerViewSkill skill="double_jump" :tree-acquired="trackedValues.tree_double_jump > 0" :acquired="trackedValues.skill_double_jump > 0" />
    <WotwTrackerViewSkill skill="regenerate" :tree-acquired="trackedValues.tree_regenerate > 0" :acquired="trackedValues.skill_regenerate > 0" />
    <WotwTrackerViewSkill skill="grapple" :tree-acquired="trackedValues.tree_grapple > 0" :acquired="trackedValues.skill_grapple > 0" />
    <WotwTrackerViewSkill skill="launch" :tree-acquired="trackedValues.tree_launch > 0" :acquired="trackedValues.skill_launch > 0" />
    <WotwTrackerViewSkill skill="flash" :tree-acquired="trackedValues.tree_flash > 0" :acquired="trackedValues.skill_flash > 0" />
    <WotwTrackerViewSkill skill="light_burst" :tree-acquired="trackedValues.tree_light_burst > 0" :acquired="trackedValues.skill_light_burst > 0" />
    <WotwTrackerViewSkill skill="ancestral_light_marsh" :tree-acquired="trackedValues.tree_ancestral_light_marsh > 0" :acquired="trackedValues.skill_ancestral_light_marsh > 0" />
  </div>
</template>

<script>
  export default {
    name: 'SkillsResources',
    layout: 'plain',
    props: {
      seedFlags: {
        type: Array,
        required: true,
      },
      trackedValues: {
        type: Object,
        required: true,
      },
      showWillowHearts: {
        type: Boolean,
        default: false,
      },
      heartCount: {
        type: Number,
        default: 0,
      },
    },
  }
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

    .resource-view {
      padding-top: 2vm;
      grid-column: 6 / span 2;
      grid-row: 1 / span 2;
      position: relative;
    }
  }
</style>
