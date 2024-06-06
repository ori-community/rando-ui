<template>
  <v-card class="season-card" :flat="flat" :to="{ name: 'league-seasons-seasonId', params: { seasonId: season.id } }">
    <v-img v-if="!!season.backgroundImageUrl" class="background-image" alt="" :src="season.backgroundImageUrl" />

    <div v-if="joinedOverlay" class="joined-overlay">
      <v-icon size="96">mdi-check</v-icon>
    </div>

    <div class="gradient-overlay"></div>

    <div class="card-tags">
      <div v-if="upcomingTag" class="px-2 blue darken-1">Upcoming</div>
      <div v-if="joinedTag" class="px-2 accent"><v-icon x-small>mdi-check</v-icon> Joined</div>
    </div>

    <div class="card-content pa-4">
      <h3>{{ season.name }}</h3>
      <div>{{ season.shortDescription }}</div>

      <div class="spacer"></div>

      <div v-if="mode === MODE_UPCOMING">
        <v-icon x-small>mdi-clock-outline</v-icon> starts at
        {{ formatDateEpoch(season.nextContinuationAt, 'P p') }}
      </div>
      <div>
        <v-icon x-small>mdi-account-multiple-outline</v-icon>
        {{ season.memberships.length }} {{ season.memberships.length === 1 ? 'player' : 'players' }},
        <v-icon x-small>mdi-gamepad-variant-outline</v-icon>
        {{ currentGameNumber }}/{{ season.gameCount }} games
      </div>
    </div>
  </v-card>
</template>

<script>
  import { formatsDates } from '~/assets/lib/formatsDates'

  export const MODE_DEFAULT = 'default'
  export const MODE_UPCOMING = 'upcoming'
  export const MODE_ACTIVE = 'active'

  export default {
    name: 'LeagueSeasonCard',
    mixins: [formatsDates],
    props: {
      season: {
        type: Object,
        required: true,
      },
      mode: {
        type: String,
        default: MODE_DEFAULT,
      },
      joinedOverlay: {
        type: Boolean,
        default: false,
      },
      joinedTag: {
        type: Boolean,
        default: false,
      },
      upcomingTag: {
        type: Boolean,
        default: false,
      },
      flat: {
        type: Boolean,
        default: false,
      },
      submissionPending: {
        type: Object,
        default: null,
      },
    },
    data: () => ({
      MODE_DEFAULT,
      MODE_UPCOMING,
      MODE_ACTIVE,
    }),
    computed: {
      currentGameNumber() {
        // return gameCount when season finished
        if (!this.season.currentGameId && !this.season.canJoin) {
          return this.season.gameCount
        }

        const currentGame = this.season.games?.find((g) => g.id === this.season.currentGameId)
        return currentGame?.gameNumber ? currentGame?.gameNumber : 0
      },
    },
  }
</script>

<style scoped lang="scss">
  .season-card {
    position: relative;
    overflow: hidden;
    transition: transform 300ms;
    border: 1px solid rgba(255, 255, 255, 0.08);
    will-change: transform;

    .joined-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: black;
      z-index: 5;
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0.6;
      pointer-events: none;
      transition: opacity 300ms;
      mix-blend-mode: multiply;
      backdrop-filter: brightness(5) saturate(6) blur(10px);

      > * {
        opacity: 1;
      }
    }

    &:hover {
      transform: scale(1.02);

      .joined-overlay {
        opacity: 0;
      }
    }

    .background-image {
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      object-fit: cover;
      width: 100%;
      height: 100%;
      opacity: 0.75;
    }

    .gradient-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to right, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 100%);
    }

    .card-content {
      position: relative;
      display: flex;
      flex-direction: column;
      height: 100%;

      .spacer {
        flex-grow: 1;
      }
    }

    .joined {
      position: absolute;
      top: 0;
      left: 0;
    }

    .card-tags {
      position: absolute;
      top: 0;
      right: 0;
      border-bottom-left-radius: 0.4em;
      overflow: hidden;
      display: flex;
      font-size: 0.8em;
    }
  }
</style>
