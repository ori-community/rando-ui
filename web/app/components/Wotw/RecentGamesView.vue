<template>
  <v-scroll-x-transition>
    <div v-if="userStore.isLoggedIn">
      <div>
        <h2 class="d-inline-block mb-3">Recent Online Games</h2>
        <v-fade-transition>
          <span v-if="(recentMultiverses?.length ?? 0) > 0">
            <nuxt-link class="pl-3 pt-2 more-label text-decoration-none" to="/my-games">
              See more
            </nuxt-link>
          </span>
        </v-fade-transition>
      </div>

      <div class="recent-games-container">
        <template
          v-for="(_count, i) in visibleRecentMultiversesCount"
          :key="i"
        >
          <div class="position-relative">
            <!-- Fake card to estimate dimensions -->
            <v-card
              :to="!!recentMultiverses?.[i] ? { name: 'game-multiverseId', params: { multiverseId: recentMultiverses[i].id } } : {}"
              class="pa-4 d-flex flex-column recent-game-card"
              :class="{fake: !recentMultiverses?.[i]}"
              :style="{transitionDelay: `${i * 50}ms`}"
              variant="text"
              border="sm"
              hover
            >
              <div class="multiverse-id-container">
                <div>
                  <span class="hashtag">#</span><span class="multiverse-id">{{ recentMultiverses?.[i]?.id ?? 0 }}</span>
                </div>
              </div>
              <v-spacer />
              <div class="pt-3 d-flex flex-wrap-reverse ga-1">
                <rando-discord-avatar v-if="recentMultiverses === null || !recentMultiverses[i]" />
                <template v-else>
                  <rando-discord-avatar
                    v-for="member in recentMultiverses[i].members"
                    :key="member.id"
                    :user="member"
                  />
                </template>
              </div>
              <div class="opacity-50 line-height-1 pt-2">
                <template v-if="recentMultiverses === null || !recentMultiverses[i]">
                  placeholder
                </template>
                <template v-else>
                  {{ useTimeAgo(recentMultiverses[i].createdAt) }}
                </template>
              </div>
            </v-card>

            <v-fade-transition>
              <!-- Loading animation inside the fake card -->
              <v-card
                v-if="recentMultiverses === null"
                class="position-absolute top-0 left-0 right-0 bottom-0"
                :style="{transitionDelay: `${i * 50}ms`}"
                variant="plain"
                hover
              >
                <v-skeleton-loader type="ossein" width="100%" height="100%" />
              </v-card>

              <!-- Create online game action card -->
              <v-card
                v-else-if="recentMultiverses?.length === 0 && i === 0"
                class="position-absolute top-0 left-0 right-0 bottom-0 d-flex align-center flex-column justify-center ga-2"
                variant="plain"
                border="sm"
                hover
                :to="{name: 'seedgen'}"
              >
                <v-icon>mdi-plus-circle-outline</v-icon>
                Create online game
              </v-card>
            </v-fade-transition>
          </div>
        </template>
      </div>
      <slot />
    </div>
  </v-scroll-x-transition>
</template>

<script lang="ts" setup>
  import type {MultiverseMetadataInfo} from "@shared/types/http-api"
  import {useTimeAgo} from "@vueuse/core"

  const {axios, catchAxiosErrors} = useAxios()
  const userStore = useUserStore()
  const {xs, mdAndDown, lgAndDown} = useDisplay()
  const recentMultiverses = ref<MultiverseMetadataInfo[] | null>(null)

  const visibleRecentMultiversesCount = computed(() => {
    switch (true) {
      case xs.value:
        return 1
      case mdAndDown.value:
        return 2
      case lgAndDown.value:
        return 3
      default:
        return 4
    }
  })

  watch(() => userStore.isLoggedIn, async () => {
    await catchAxiosErrors(
      async () => {
        recentMultiverses.value = (await axios.get("/multiverses/own", {params: {limit: 4}})).data
      },
      async (e) => {
        recentMultiverses.value = null
        console.error(e)
      },
    )
  }, {immediate: true})
</script>

<style lang="scss" scoped>
  .recent-games-container {
    display: grid;
    grid-auto-columns: 1fr;
    grid-auto-flow: column;
    align-items: stretch;
    gap: 0.75em;
  }

  .multiverse-id-container {
    display: flex;
    flex-direction: column;
    line-height: 1;

    .hashtag {
      font-size: 1em;
    }

    .multiverse-id {
      font-size: 1.5em;
      font-weight: 900;
    }
  }

  .more-label {
    opacity: 0.5;
    transition: opacity 200ms;

    &:hover {
      opacity: 1;
    }
  }

  .recent-game-card {
    transition: opacity 1000ms;

    &.fake {
      opacity: 0;
      pointer-events: none;
      user-select: none;
    }
  }

  .line-height-1 {
    line-height: 1;
  }
</style>
