<template>
  <v-badge :model-value="connected" color="green" location="bottom right" bordered dot>
    <v-avatar :color='raceReady ? "success" : "accent"' :size="size">
      <v-icon v-if="raceReady">mdi-check</v-icon>
      <v-img v-else-if="discordAvatarUrl !== null" :src="discordAvatarUrl">
        <template #placeholder>
          <div class="d-flex align-center justify-center fill-height">
            <v-icon :size='Number($attrs.Size) * 0.6 || "19"'>mdi-account</v-icon>
          </div>
        </template>
      </v-img>
    </v-avatar>
  </v-badge>
</template>

<script lang="ts" setup>
  import type {UserInfo} from "@shared/types/http-api"

  const props = withDefaults(
    defineProps<{
      user: UserInfo,
      connected?: boolean,
      raceReady?: boolean,
      size?: number,
    }>(), {
      connected: false,
      raceReady: false,
      size: 32,
    },
  )

  const discordAvatarUrl = computed(() => {
    if (!props.user.avatarId) {
      return null
    }

    return `https://cdn.discordapp.com/avatars/${props.user.id}/${props.user.avatarId}.png`
  })
</script>

<style lang="scss">
  .v-badge .v-badge__badge::after {
    border-color: rgb(var(--v-background-lighten2)) !important;
  }
</style>
