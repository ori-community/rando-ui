<template>
  <v-container>
    <h2>Bingo Tools</h2>

    <v-row>
      <v-col cols="6">
        <v-text-field v-model="claimX" type="number" label="X" />
      </v-col>
      <v-col cols="6">
        <v-text-field v-model="claimY" type="number" label="Y" />
      </v-col>
    </v-row>

    <v-btn color="accent" @click="claim">
      Claim Bingo Card
    </v-btn>
  </v-container>
</template>

<script>
  export default {
    data: () => ({
      claimX: 1,
      claimY: 1,
    }),
    methods: {
      async claim() {
        try {
          await this.$axios.$post('/dev/bingo/claim', {
            x: this.claimX,
            y: this.claimY,
          })
        } catch (e) {
          console.error(e)
        }
      },
    }
  }
</script>

<style scoped>

</style>
