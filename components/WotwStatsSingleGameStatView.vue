<template>
  <v-card max-width='1000'>
    <div class='global-stats pa-5 py-8'>
      <img class='background' :src='require(`@/assets/images/ori_running.png`)' alt=''>
      <div class='gradient-overlay gradient-x-overlay'></div>
      <div class='stats-content'>
        <h1 class='stat-heading'>Global Stats</h1>
        <div class=' d-flex flex-wrap stats-container'>
          <wotw-stats-singlestat-view label='Time' :text='formatTime(uberValue(14, 100))' />
          <wotw-stats-singlestat-view label='Deaths' :text='uberValue(14, 101)' />
          <wotw-stats-singlestat-view label='Time lost' :text='formatTime(uberValue(14, 105))' />
          <wotw-stats-singlestat-view label='Warps' :text='uberValue(14, 106)' />
          <wotw-stats-singlestat-view label='PPM' :text='getPPM(uberValue(6, 2), uberValue(14, 100))' />
          <wotw-stats-singlestat-view label='Peak PPM'>
            {{ uberValue(14, 108) }} <small>at {{ formatTime(uberValue(14, 107)) }}</small>
          </wotw-stats-singlestat-view>
          <wotw-stats-singlestat-view
            :progress='(uberValue(6, 2) || 0) / (uberValue(14, 109) || 1)'
            :text='`${uberValue(6, 2)} / ${uberValue(14, 109)}`'
            label='Pickups'
          />
        </div>
      </div>
    </div>

    <div>
      <transition-group name='list'>
        <div v-for='zone in sortedZones' :key='zone.id' class='area-stats pa-5'>
          <div class='gradient-overlay gradient-x-overlay'></div>
          <div class='gradient-overlay gradient-y-overlay'></div>
          <img class='background' :src='require(`@/assets/images/areas/${zone.id}.jpg`)' alt=''>
          <div class='stats-content'>
            <h3 class='stat-heading'>{{ zone.name }}</h3>
            <div class='d-flex flex-wrap stats-container mb-1'>
              <wotw-stats-singlestat-view label='Time' :text='formatTime(uberValue(14, zone.id))' />
              <wotw-stats-singlestat-view label='Deaths' :text='uberValue(14, 20 + zone.id)' />
              <wotw-stats-singlestat-view label='PPM' :text='getPPM(uberValue(14, 40 + zone.id), uberValue(14, zone.id))' />
              <wotw-stats-singlestat-view
                :progress='(uberValue(14, 40 + zone.id) || 0) / (uberValue(14, 60 + zone.id) || 1)'
                :text='`${uberValue(14, 40 + zone.id)} / ${uberValue(14, 60 + zone.id)}`'
                label='Pickups'
                :progress-size='20'
              />
            </div>
            <v-progress-linear class='mt-3' :value='getZoneTimePercentage(zone.id)' />
          </div>
        </div>
      </transition-group>
    </div>
  </v-card>
</template>

<script>
  import { mapGetters } from 'vuex'
  import zones from '@/assets/db/zones.yaml'

  export default {
    name: 'WotwStatsSingleGameStatView',
    props: {
      stat: {
        type: Object,
        required: true,
      },
    },
    data: () => ({
      stats: null,
    }),
    computed: {
      ...mapGetters('uberStates', {uberValue: 'value'}),
      sortedZones() {
        return [...zones].sort((a, b) => this.getZoneTimePercentage(b.id) - this.getZoneTimePercentage(a.id))
      },
    },
    mounted() {
      this.fetchStats()
    },
    methods: {
      getZoneTimePercentage(zoneId) {
        return (this.uberValue(14, zoneId) / this.uberValue(14, 100)) * 100
      },
      getPPM(pickups, totalSeconds) {
        const minutes = totalSeconds / 1000
        if (totalSeconds <= 10 || pickups < 5) {
          return '-'
        }
        return pickups / minutes
      },
      formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor(totalSeconds % 3600 / 60)
        const seconds = totalSeconds % 60
        return (hours > 0 ? `${hours.toFixed(0)}:` : '') + `${minutes.toFixed(0).padStart(2, '0')}:${seconds.toFixed(1).padStart(4, '0')}`
      },
      fetchStats() {
        const statsUberStates = []

        statsUberStates.push({group: 6, state: 2}) // Pickups Collected
        statsUberStates.push({group: 14, state: 100}) // Time
        statsUberStates.push({group: 14, state: 101}) // Deaths
        statsUberStates.push({group: 14, state: 102}) // Current Drought
        statsUberStates.push({group: 14, state: 103}) // Longest Drought
        statsUberStates.push({group: 14, state: 104}) // Time since last checkpoint
        statsUberStates.push({group: 14, state: 105}) // Time lost to deaths
        statsUberStates.push({group: 14, state: 106}) // Warps used
        statsUberStates.push({group: 14, state: 107}) // Peak PPM time
        statsUberStates.push({group: 14, state: 108}) // Peak PPM count
        statsUberStates.push({group: 14, state: 109}) // Total Pickup count
        for (const zone of zones) {
          statsUberStates.push({group: 14, state: zone.id}) // Time spent
          statsUberStates.push({group: 14, state: 20 + zone.id}) // Deaths
          statsUberStates.push({group: 14, state: 40 + zone.id}) // Pickups
          statsUberStates.push({group: 14, state: 60 + zone.id}) // Total Pickup Count
        }

        setInterval(async () => {
          await this.$store.dispatch('uberStates/updateUberStates', statsUberStates)
        }, 500)
      }
    }
  }
</script>

<style lang='scss' scoped>
  .stats-container {
    row-gap: 1em;
    column-gap: 2em;
  }

  .global-stats {
    font-size: 1.2em;
  }

  .stat-heading {
    color: var(--v-primary-base);
  }

  .area-stats,
  .global-stats {
    position: relative;
    width: 100%;


    .background {
      position: absolute;
      object-fit: cover;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 0;
      opacity: 0.75;
    }

    .gradient-overlay {
      z-index: 1;
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;

      &.gradient-x-overlay {
        background: linear-gradient(to right, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 100%);
      }

      &.gradient-y-overlay {
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0) 60%, rgba(0, 0, 0, 0.7) 100%);
      }
    }

    .stats-content {
      position: relative;
      z-index: 10;
    }
  }

  .global-stats {
    background-color: black;

    .background {
      object-fit: scale-down;
      object-position: bottom right;
    }
  }
</style>
