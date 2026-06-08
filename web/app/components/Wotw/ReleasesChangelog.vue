<template>
  <div>
    <v-card v-for="release in releases" :key="release.version" class="release-card mb-2" color="background-lighten-1">
      <template #text>
        <div class="name mb-2">
          Version {{ release.version }}
          <v-chip v-if="release.isNew" color="accent" variant="flat" size="small" class="ml-1">NEW</v-chip>
        </div>
        <div>
          <vue-markdown :source="release.notes" />
        </div>
        <div class="metadata d-flex justify-end align-center ga-2 text-body-small">
          <div class="actions d-flex">
            <v-btn size="small" variant="text" density="compact" @click="emit('installRelease', release)">
              <template v-if="release.isNew">Update to this version</template>
              <template v-else-if="release.isCurrent">Re-Install this version</template>
              <template v-else>Downgrade to this version</template>
            </v-btn>
            <v-divider class="mr-2 ml-1" vertical />
          </div>
          <div>
            {{ formatDistanceToNow(release.releaseTimestamp, {addSuffix: true}) }}
          </div>
          <div>
            <v-icon size="small">mdi-download-outline</v-icon>
            {{ release.downloads }}
          </div>
        </div>
      </template>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
  import VueMarkdown from "vue-markdown-render"
  import {formatDistanceToNow} from "date-fns"

  const emit = defineEmits<{
    installRelease: [Release],
  }>()

  defineProps<{
    releases: Release[]
  }>()
</script>

<style lang="scss" scoped>
  .release-card {
    .name {
      font-size: 1.3em;
    }

    .metadata {
      opacity: 0.5;
    }

    .actions {
      opacity: 0;
      pointer-events: none;
      transform: translateX(4px);
      transition: transform 0.2s, opacity 0.2s;
    }

    &:hover {
      .actions {
        opacity: 1;
        transform: translateX(0);
        pointer-events: all;
      }
    }
  }
</style>
