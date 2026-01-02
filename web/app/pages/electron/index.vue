<template>
  <v-container>
    <div class="text-center">
      <v-btn :loading="isLaunching" @click="launch()">Lauch</v-btn>
    </div>
  </v-container>
</template>

<script setup lang="ts">
  const {isLaunching, launch} = useLauncherHelper()
</script>
