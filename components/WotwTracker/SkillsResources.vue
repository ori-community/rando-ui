<template>
  <div class="skills pa-1">
    <WotwTrackerViewSkill skill="spike" :active="trackedValues.skill_spike" />
    <WotwTrackerViewSkill skill="sentry" :active="trackedValues.skill_sentry" />
    <WotwTrackerViewSkill skill="blaze" :active="trackedValues.skill_blaze" />
    <WotwTrackerViewSkill skill="flap" :active="trackedValues.skill_flap" />
    <WotwTrackerViewSkill class="clean-water" skill="clean_water" :active="trackedValues.skill_clean_water" />
    <WotwTrackerViewResource
      class="resource-view"
      :finished="trackedValues.game_finished"
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
    />
    <WotwTrackerViewSkill skill="hammer" :active="trackedValues.skill_hammer" />
    <WotwTrackerViewSkill skill="shuriken" :active="trackedValues.skill_shuriken" />
    <WotwTrackerViewSkill skill="water_breath" :active="trackedValues.skill_water_breath" />
    <WotwTrackerViewSkill skill="glide" :active="trackedValues.skill_glide" />

    <WotwTrackerViewSkill skill="sword" :tree="trackedValues.tree_sword" :active="trackedValues.skill_sword" />
    <WotwTrackerViewSkill skill="bow" :tree="trackedValues.tree_bow" :active="trackedValues.skill_bow" />
    <WotwTrackerViewSkill skill="bash" :tree="trackedValues.tree_bash" :active="trackedValues.skill_bash" />
    <WotwTrackerViewSkill skill="dash" :tree="trackedValues.tree_dash" :active="trackedValues.skill_dash" />
    <WotwTrackerViewSkill skill="water_dash" :tree="trackedValues.tree_water_dash" :active="trackedValues.skill_water_dash" />
    <WotwTrackerViewSkill skill="burrow" :tree="trackedValues.tree_burrow" :active="trackedValues.skill_burrow" />
    <WotwTrackerViewSkill
      skill="ancestral_light_glades"
      :tree="trackedValues.tree_ancestral_light_glades"
      :active="trackedValues.skill_ancestral_light_glades"
    />
    <WotwTrackerViewSkill skill="double_jump" :tree="trackedValues.tree_double_jump" :active="trackedValues.skill_double_jump" />
    <WotwTrackerViewSkill skill="regenerate" :tree="trackedValues.tree_regenerate" :active="trackedValues.skill_regenerate" />
    <WotwTrackerViewSkill skill="grapple" :tree="trackedValues.tree_grapple" :active="trackedValues.skill_grapple" />
    <WotwTrackerViewSkill skill="launch" :tree="trackedValues.tree_launch" :active="trackedValues.skill_launch" />
    <WotwTrackerViewSkill skill="flash" :tree="trackedValues.tree_flash" :active="trackedValues.skill_flash" />
    <WotwTrackerViewSkill skill="light_burst" :tree="trackedValues.tree_light_burst" :active="trackedValues.skill_light_burst" />
    <WotwTrackerViewSkill skill="ancestral_light_marsh" :tree="trackedValues.tree_ancestral_light_marsh" :active="trackedValues.skill_ancestral_light_marsh" />
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
      gameFinished: {
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
