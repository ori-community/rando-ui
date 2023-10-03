<template>
  <div class="d-flex flex-column flex-grow-1">
    <v-slider v-model="timelineProgress" min="0" :max="spoiler?.groups.length ?? 0" />
    <wotw-map v-if="!!spoiler" class="flex-grow-1 flex-shrink-1">
      <k-layer>
        <k-circle v-for="(item, index) in items" :key="index" :config="item" />
      </k-layer>
    </wotw-map>
  </div>
</template>

<script>
  export default {
    name: 'SeedSpoiler',
    layout: 'default-without-footer',
    data: () => ({
      spoiler: null,
      timelineProgress: 0,
    }),
    computed: {
      seedId() {
        return Number(this.$route.params.seedId)
      },
      items() {
        if (!this.spoiler) {
          return []
        }

        const items = []

        for (let groupIndex = 0; groupIndex <= Math.min(this.timelineProgress, this.spoiler.groups.length - 1); groupIndex++) {
          const group = this.spoiler.groups[groupIndex]

          for (const placement of group.placements) {
            if (placement.location.position === null) {
              continue
            }

            items.push({
              x: placement.location.position.x,
              y: placement.location.position.y,
              radius: 6,
              fill: '#ffffff',
              name: placement.itemName,
            })
          }
        }

        return items
      },
    },
    mounted() {
      this.fetchSpoiler()
    },
    methods: {
      async fetchSpoiler() {
        this.spoiler = await this.$axios.$get(`/seeds/${this.seedId}/spoiler`)
      },
    },
  }
</script>

<style scoped></style>
