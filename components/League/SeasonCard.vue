<template>
  <v-card class="season-card" :to="{name: 'league-seasons-seasonId', params: {seasonId: season.id}}">
    <img v-if="!!season.backgroundImageUrl" class="background-image" alt="" :src="season.backgroundImageUrl" />

    <div class="gradient-overlay"></div>

    <div v-if="mode === MODE_UPCOMING" class="card-tag px-2 blue darken-1">
      Upcoming
    </div>
    <div v-else-if="mode === MODE_ACTIVE" class="card-tag px-2 green darken-2">
      Active
    </div>

    <div class="card-content pa-4">
      <h3>{{ season.name }}</h3>
      <div>{{ season.shortDescription }}</div>

      <div class="spacer"></div>

      <div v-if="mode === MODE_UPCOMING">
        <v-icon x-small>mdi-clock-outline</v-icon> starts at
        {{ formatDateEpoch(season.nextContinuationAt, 'dd.MM.yyyy HH:mm') }}
      </div>
      <div>
        <v-icon x-small>mdi-account-multiple-outline</v-icon>
        {{ season.memberships.length }} {{ season.memberships.length === 1 ? 'player' : 'players' }}
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
    },
    data: () => ({
      MODE_DEFAULT,
      MODE_UPCOMING,
      MODE_ACTIVE,
    }),
  }
</script>

<style scoped lang="scss">
  .season-card {
    position: relative;
    overflow: hidden;
    transition: transform 300ms;
    border: 1px solid rgba(255, 255, 255, 0.4);

    &:hover {
      transform: scale(1.02);
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

    .card-tag {
      position: absolute;
      top: 0;
      right: 0;
      border-bottom-left-radius: 0.4em;
    }
  }
</style>