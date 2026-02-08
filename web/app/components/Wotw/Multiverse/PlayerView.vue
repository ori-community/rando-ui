<template>
  <div class="player-view gap-10">
    <rando-discord-avatar
      :user="user"
      :connected="connected"
      :race-ready="showGreenCheckmark"
    />
    <div class="d-block text-left">
      <div class="name-and-points">
        {{ user.name }}
        <rando-copyable-info v-if="devtoolsEnabled" :value="user.id.toString()" />
      </div>
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type {UserInfo} from "@shared/types/http-api"
  import {useDevtoolsStore} from "~/stores/devtools"

  withDefaults(defineProps<{
    user: UserInfo,
    connected?: boolean,
    showGreenCheckmark?: boolean,
  }>(), {
    connected: false,
    showGreenCheckmark: false,
  })

  const {devtoolsEnabled} = storeToRefs(useDevtoolsStore())
</script>

<style lang="scss" scoped>
  .player-view {
    display: flex;
    align-items: center;
    line-height: 1;

    .name-and-points {
      display: flex;
      gap: 0.5em;
    }
  }
</style>
