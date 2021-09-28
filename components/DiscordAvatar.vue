<template>
  <v-badge :value='!!user.connectedMultiverseId && user.connectedMultiverseId === multiverseId' mode='1' color='green' bottom bordered dot offset-x='8' offset-y='8'>
    <v-avatar color='accent' :size='$attrs.size || "32"' v-bind='$attrs'>
      <v-img v-if='discordAvatarUrl !== null' :src='discordAvatarUrl' />
      <v-icon v-else>mdi-account</v-icon>
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
