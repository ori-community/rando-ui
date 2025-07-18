<template>
  <v-container>
    <h1 class='text-center mt-12 mb-6'>Settings</h1>

    <v-scroll-y-transition>
      <v-card v-show="settingsStore.isInitialized">
        <v-tabs v-model="tab">
          <v-tab :value="1">General</v-tab>
          <v-tab :value="2">Controller</v-tab>
          <v-tab :value="3">Keyboard</v-tab>
        </v-tabs>
        <v-tabs-window v-model="tab">

          <v-tabs-window-item :value="1" class='pa-5'>
            <wotw-settings-general/>
          </v-tabs-window-item>
          <v-tabs-window-item :value="2" class='pa-5'>
            <!--            <wotw-settings-rebind type='controller'/>-->
          </v-tabs-window-item>
          <v-tabs-window-item :value="3" class='pa-5'>
            <!--            <wotw-settings-rebind type='kbm'/>-->
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card>
    </v-scroll-y-transition>
  </v-container>
</template>

<script lang="ts" setup>
  const settingsStore = useSettingsStore()
  const tab = ref(1)
</script>

<style scoped>

</style>
