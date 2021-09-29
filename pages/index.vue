<template>
  <v-container>
    <div class='text-center'>
      <h1 class='mt-12 mb-6'>Ori and the Will of the Wisps Randomizer</h1>

      <div class='mb-6'>
        <v-btn large text href='https://wiki.orirando.com'>
          <v-icon left>mdi-book-outline</v-icon>
          Read the Wiki
        </v-btn>
      </div>

      <div class='mb-6'>
        <div class='text-left d-inline-block'>
          Welcome to the Ori and the Will of the Wisps Randomizer!<br>
          If you're somewhat familiar with the Randomizer, you can start right
          away by generating a seed using the online
          <nuxt-link to='/seedgen'>seed generator</nuxt-link>.<br>
          Otherwise, take a look at the <a href='https://wiki.orirando.com'>wiki</a>
          on how to get started.
        </div>
      </div>

      <v-btn x-large depressed color='accent' to='/seedgen'>
        <v-icon left>mdi-dice-multiple</v-icon>
        Generate a seed
      </v-btn>


      <div class='hover-transparency py-12 mt-4'>
        <div class='mb-1'>Already have a seed?</div>

        <wotw-new-game-menu small />
      </div>
    </div>
  </v-container>
</template>

<script>
  export default {
    name: 'Index',
  }
</script>

<style lang='scss' scoped>
  .hover-transparency {
    opacity: 0.5;
    transition: opacity 200ms;

    &:hover {
      opacity: 1;
    }
  }
</style>
