<template>
  <v-container>
    <v-btn @click="mapDialogOpen = true">Open</v-btn>
    <v-file-input v-model="selectedFile" multiple/>
    <v-dialog v-model="mapDialogOpen" height="90%" max-width="1200">
      <v-card class="fill-height relative">
        <wotw-map v-if="saveFiles !== null" :save-files="saveFiles"/>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
  import type {SaveFile} from "@/components/Wotw/Map.vue"

  useHead({title: "Map"})

  const mapDialogOpen = ref(false)
  const saveFiles = ref<SaveFile[] | null>(null)
  const selectedFile = ref<File[]>([])

  watch(selectedFile, async (newValue) => {
    saveFiles.value = await Promise.all(newValue.map((file: File) => (async () => ({
      name: file.name,
      data: await file.arrayBuffer(),
    }))()))
  })
</script>

<style lang="scss" scoped>

</style>
