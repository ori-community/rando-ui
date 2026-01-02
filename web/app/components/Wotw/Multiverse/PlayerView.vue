<template>
  <div class='player-view'>
    <rando-discord-avatar :user='user' class='mr-1' :connected="isConnected" :race-ready="showGreenCheckmark"
                          v-bind='$attrs'/>
    <div>
      <div class="name-and-points">
        {{ user.name }}
        <copyable-info v-if="devtoolsEnabled" :value="user.id"/>
      </div>
      <slot/>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type {UniverseInfo} from "@shared/proto/messages";

  withDefaults(defineProps<{
    user: UniverseInfo,
    isConnected?: boolean,
    showGreenCheckmark?: boolean,
  }>(), {
    isConnected: false,
    showGreenCheckmark: false,
  })
</script>

<style lang="scss" scoped>
  .player-view {
    display: flex;
    align-items: center;
    line-height: 1;
    gap: 0.1em;

    .name-and-points {
      display: flex;
      gap: 0.5em;
    }
  }
</style>
