<template>
  <v-container>
    <h2>Impersonation</h2>

    <v-row>
      <v-col cols="12">
        <v-text-field v-model="impersonateUserId" label="Impersonate User ID" />
      </v-col>
    </v-row>

    <v-btn color="accent" @click="impersonate">
      Impersonate
    </v-btn>
  </v-container>
</template>

<script>
  export default {
    data: () => ({
      impersonateUserId: '',
    }),
    methods: {
      async impersonate() {
        try {
          const generatedToken = await this.$axios.$post('/impersonate', {
            userId: this.impersonateUserId,
          })

          this.$axios.setToken(generatedToken, 'Bearer')
          await this.$store.dispatch('auth/setJwt', generatedToken)
          await this.$store.dispatch('user/updateUser')
        } catch (e) {
          console.error(e)
        }
      },
    }
  }
</script>

<style scoped>

</style>
