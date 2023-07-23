<template>
  <v-badge :value='!!user.connectedMultiverseId && user.connectedMultiverseId === multiverseId' color='green' bottom bordered dot offset-x='8' offset-y='8'>
    <v-avatar :color='user.raceReady ? "success" : "accent"' :size='$attrs.size || "32"' v-bind='$attrs'>
      <v-icon v-if="user.raceReady">mdi-check</v-icon>
      <v-img v-else-if='discordAvatarUrl !== null' :src='discordAvatarUrl'>
        <template #placeholder>
          <div class='d-flex align-center justify-center fill-height'>
            <v-icon :size='$attrs.size * 0.6 || "19"'>mdi-account</v-icon>
          </div>
        </template>
      </v-img>
    </v-avatar>
  </v-badge>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    name: 'DiscordAvatar',
    props: {
      user: {
        type: Object,
        required: true,
      },
      multiverseId: {
        type: Number,
        required: false,
        default: null,
      }
    },
    computed: {
      ...mapGetters('user', ['isLoggedIn']),
      discordAvatarUrl() {
        if (!this.isLoggedIn || !this.user.avatarId) {
          return null
        }

        return `https://cdn.discordapp.com/avatars/${this.user.id}/${this.user.avatarId}.png`
      },
    },
  }
</script>

<style lang='scss'>
  .v-badge .v-badge__badge::after {
    border-color: var(--v-background-lighten2) !important;
  }
</style>
