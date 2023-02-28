<template>
  <v-container>
    <h2>Access Token Generator</h2>

    <v-row>
      <v-col cols="12">
        <v-text-field v-model="scopes" label="Scopes separated by comma" />
      </v-col>
    </v-row>

    <v-btn color="accent" @click="generate">
      Generate
    </v-btn>

    <pre v-if="!!generatedToken">{{ generatedToken }}</pre>
  </v-container>
</template>

<script>
  export default {
    data: () => ({
      scopes: '*',
      generatedToken: null,
    }),
    methods: {
      async generate() {
        try {
          this.generatedToken = await this.$axios.$post('/tokens/', {
            scopes: this.scopes.split(',').map(s => s.trim()),
          })
        } catch (e) {
          this.generatedToken = e
          console.error(e)
        }
      }
    }
  }
</script>

<style scoped>

</style>
