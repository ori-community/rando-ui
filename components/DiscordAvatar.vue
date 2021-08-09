<template>
  <v-avatar color='accent' :size='$attrs.size || "32"' v-bind='$attrs'>
    <v-img v-if='discordAvatarUrl !== null' :src='discordAvatarUrl' />
    <v-icon v-else>mdi-account</v-icon>
  </v-avatar>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    name: 'DiscordAvatar',
    props: {
      user: {
        type: Object,
        required: true,
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
    }
  }
</script>

<style scoped>

</style>
