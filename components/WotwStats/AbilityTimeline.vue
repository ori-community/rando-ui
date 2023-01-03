<template>
  <div ref="container" class="abilities-container" :style="{ height: `${abilityRenderInformation.totalHeight}px` }">
    <template v-for="ability in abilityRenderInformation.abilities">
      <v-tooltip :key="ability.abilityId" right>
        <template #activator="{on}">
          <div
            class="ability"
            :style="{ left: `${ability.leftMargin}px`, top: `${ability.topMargin}px` }"
            v-on="on"
          >
            <img :src="getAbilityImageFromId(ability.abilityId)" alt="" />
          </div>
        </template>
        <span>{{ getAbilityName(ability.abilityId) }} at {{ formatTime(ability.time) }}</span>
      </v-tooltip>
    </template>

    <v-fade-transition>
      <div v-if="!anyAbilityCollected" class="no-abilities">
        no abilities collected yet
      </div>
    </v-fade-transition>
  </div>
</template>

<script>
  import abilities from '@/assets/data/abilities.yaml'
  import { hasOwnProperty } from '~/assets/lib/hasOwnProperty'
  import { formatTime } from '~/assets/lib/formatTime'

  export default {
    name: 'AbilityTimeline',
    props: {
      totalTime: {
        type: Number,
        required: true,
      },
      abilityTimestamps: {
        type: Object,
        required: true,
      },
    },
    data: () => ({
      resizeObserver: null,
      viewWidth: 1000,
    }),
    computed: {
      anyAbilityCollected() {
        return Object.values(this.abilityTimestamps).length > 0
      },
      abilitiesSortedByTime() {
        const abilitiesSortedByTime = []

        for (const [abilityId, time] of Object.entries(this.abilityTimestamps)) {
          abilitiesSortedByTime.push({ abilityId: Number(abilityId), time })
        }

        abilitiesSortedByTime.sort((a, b) => a.time - b.time)

        return abilitiesSortedByTime
      },
      abilityRenderInformation() {
        const abilityIconWidth = 48
        const laneHeight = 48

        const abilityRenderInformation = {
          abilities: this.abilitiesSortedByTime,
          totalHeight: 0,
        }

        // Insert render information
        const lanes = [] // Contains the distance this lane is filled up to

        abilityLoop: for (const ability of abilityRenderInformation.abilities) {
          const relativeTime = ability.time / (this.totalTime || 1)
          ability.leftMargin = this.viewWidth * relativeTime - abilityIconWidth * relativeTime

          for (let laneIndex = 0; laneIndex < lanes.length; laneIndex++) {
            if (ability.leftMargin > lanes[laneIndex]) {
              ability.topMargin = laneHeight * laneIndex
              lanes[laneIndex] = ability.leftMargin + abilityIconWidth
              continue abilityLoop
            }
          }

          ability.topMargin = laneHeight * lanes.length
          lanes.push(ability.leftMargin + abilityIconWidth)
        }

        abilityRenderInformation.totalHeight = laneHeight * lanes.length

        return abilityRenderInformation
      },
    },
    mounted() {
      this.refreshViewWidth()

      this.resizeObserver = new ResizeObserver(() => {
        this.refreshViewWidth()
      })
      this.resizeObserver.observe(this.$refs.container)
    },
    beforeDestroy() {
      this.resizeObserver?.unobserve(this.$refs.container)
    },
    methods: {
      refreshViewWidth() {
        this.viewWidth = this.$refs.container.clientWidth
      },
      getAbilityImageFromId(abilityId) {
        const localAbilities = abilities // Webpack is too stupid to figure out the require() call
        return hasOwnProperty(localAbilities, abilityId)
          ? require(`@/assets/images/tracker/skills/${localAbilities[abilityId].icon_name}.png`)
          : ''
      },
      getAbilityName(abilityId) {
        return hasOwnProperty(abilities, abilityId)
          ? abilities[abilityId].name
          : '???'
      },
      formatTime,
    },
  }
</script>

<style lang="scss" scoped>
  .abilities-container {
    min-height: 48px;
    position: relative;
    transition: height 200ms;
    box-sizing: content-box;
    // border-top: 2px solid var(--v-primary-darken4);
    // border-bottom: 2px solid var(--v-primary-darken4);

    .ability {
      position: absolute;
      width: 48px;
      height: 48px;
      transition: left 500ms linear, top 500ms;
      border-left: 2px solid var(--v-primary-darken1);
      padding-left: 2px;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
  }

  .no-abilities {
    position: absolute;
    display: flex;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    justify-content: center;
    align-items: center;
  }
</style>
