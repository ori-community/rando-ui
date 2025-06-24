<template>
  <v-badge :value='connected' color='green' location="bottom right" bordered dot offset-x='4'>
    <v-avatar :color='raceReady ? "success" : "accent"' :size='Number($attrs.Size) || "32"' v-bind='$attrs'>
      <v-icon v-if="raceReady">mdi-check</v-icon>
      <v-img v-else-if='discordAvatarUrl !== null' :src='discordAvatarUrl'>
        <template #placeholder>
          <div class='d-flex align-center justify-center fill-height'>
            <v-icon :size='Number($attrs.Size) * 0.6 || "19"'>mdi-account</v-icon>
          </div>
        </template>
      </v-img>
    </v-avatar>
  </v-badge>
</template>

<script lang="ts" setup>
  import type {UserInfo} from "@shared/types/user"
  import {type PropType} from 'vue'

  const props = defineProps({
    user: {
      type: Object as PropType<UserInfo>,
      required: true,
    },
    connected: {
      type: Boolean,
      required: false,
      default: false,
    },
    raceReady: {
      type: Boolean,
      required: false,
      default: false,
    },
  })
  const discordAvatarUrl = computed(() => {
    if (!props.user.avatarId) {
      return null
    }

    return `https://cdn.discordapp.com/avatars/${props.user.id}/${props.user.avatarId}.png`

  })
</script>

<style lang='scss'>
  .v-badge .v-badge__badge::after {
    border-color: var(--v-background-lighten2) !important;
  }
</style>
