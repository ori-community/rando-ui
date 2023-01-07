<template>
  <div class="single-game-stats">
    <div class="d-flex pb-1">
      <v-spacer />
      <v-btn
        small
        :disabled="!statsLoadedOnce || screenshotCopied"
        :loading="screenshotLoading"
        @click="screenshotAndCopy($refs.statsContainer)"
        text
      >
        <v-icon left>{{ screenshotCopied ? 'mdi-check' : 'mdi-content-copy' }}</v-icon>
        {{ screenshotCopied ? 'Copied' : 'Copy screenshot' }}
      </v-btn>
    </div>

    <v-card color="black">
      <div v-if="!statsLoadedOnce" class="pa-4 text-center">
        Stats can currently only be displayed if the game is running and loaded.<br />
        Please make sure the game is running.
      </div>

      <div ref="statsContainer" v-else>
        <div class="global-stats pa-5 py-8">
          <img class="background" :src="require(`@/assets/images/ori_running_top_right.png`)" alt="" />
          <div class="gradient-overlay gradient-x-overlay"></div>
          <div class="stats-content">
            <h1 class="stat-heading">Global Stats</h1>
            <div class="d-flex flex-wrap stats-container">
              <wotw-stats-singlestat-view label="Time" :text="formatTime(stats.save.total_time)" />
              <wotw-stats-singlestat-view label="Deaths" :text="stats.save.total_deaths" />
              <wotw-stats-singlestat-view label="Time lost" :text="formatTime(stats.save.time_lost_to_deaths)" />
              <wotw-stats-singlestat-view label="TPs" :text="stats.save.teleport_count" />
              <wotw-stats-singlestat-view
                label="PPM"
                :text="calculatePPM(stats.checkpoint.total_pickups, stats.save.total_time)"
              />
              <wotw-stats-singlestat-view label="Peak PPM">
                <template v-if="stats.save.max_ppm_over_timespan > 0">
                  {{ stats.save.max_ppm_over_timespan.toFixed(1) }}
                  <div class="d-inline-block text-right max-ppm-time">
                    {{ formatTime(Math.max(stats.save.max_ppm_over_timespan_at - 600, 0), 0) }} -
                    {{ formatTime(Math.max(stats.save.max_ppm_over_timespan_at, 0), 0) }}
                  </div>
                </template>
                <template v-else>
                  -
                </template>
              </wotw-stats-singlestat-view>
              <wotw-stats-singlestat-view
                :progress="(stats.checkpoint.total_pickups || 0) / (pickupCounts.total || 1)"
                :text="`${stats.checkpoint.total_pickups} / ${pickupCounts.total}`"
                label="Pickups"
              />
            </div>
          </div>

          <div class="pt-8 ability-timeline">
            <wotw-stats-key-events-timeline
              :total-time="stats.save.total_time"
              :ability-timestamps="stats.save.ability_timestamps"
              :world-event-timestamps="stats.save.world_event_timestamps"
            />
          </div>
        </div>

        <div>
          <transition-group name="list" tag="div" class="area-stats-container" :style="{gridTemplateRows: `repeat(${Math.ceil(sortedZones.length / 2)}, 1fr)`}">
            <div v-for="zone in sortedZones" :key="zone.id" class="area-stats pa-5">
              <div class="gradient-overlay gradient-x-overlay both-sides"></div>
              <div class="gradient-overlay gradient-y-overlay"></div>
              <img class="background" :src="require(`@/assets/images/areas/${zone.id}.jpg`)" alt="" />
              <div class="stats-content">
                <div class="d-flex flex-wrap stats-container mb-1">
                  <wotw-stats-singlestat-view
                    label="Time"
                    :text="formatTime(stats.save.area_stats[zone.id]?.time_spent ?? 0)"
                  />
                  <wotw-stats-singlestat-view label="Deaths" :text="stats.save.area_stats[zone.id]?.deaths ?? 0" />
                  <wotw-stats-singlestat-view
                    label="PPM"
                    :text="
                      calculatePPM(
                        stats.checkpoint.pickups_per_area[zone.id] ?? 0,
                        stats.save.area_stats[zone.id]?.time_spent ?? 0,
                      )
                    "
                  />
                  <wotw-stats-singlestat-view
                    :progress="(stats.checkpoint.pickups_per_area[zone.id] ?? 0) / (pickupCounts.areas[zone.id] || 1)"
                    :text="`${stats.checkpoint.pickups_per_area[zone.id] ?? 0} / ${pickupCounts.areas[zone.id]}`"
                    label="Pickups"
                    :progress-size="20"
                  />
                  <h3 class="stat-heading area-name">{{ zone.name }}</h3>
                </div>
                <v-progress-linear class="mt-3" :value="getZoneTimePercentage(zone.id)" />
              </div>
            </div>
          </transition-group>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script>
  import { toBlob } from 'html-to-image'
  import zones from '@/assets/data/zones.yaml'
  import { formatTime } from '@/assets/lib/formatTime'

  export default {
    name: 'WotwStatsSingleGameStatView',
    data: () => ({
      refreshTimeoutId: null,
      stats: null,
      pickupCounts: null,
      statsLive: false,
      statsLoadedOnce: false,
      screenshotLoading: false,
      screenshotCopied: false,
    }),
    computed: {
      sortedZones() {
        return [...zones].sort((a, b) => this.getZoneTimePercentage(b.id) - this.getZoneTimePercentage(a.id))
      },
    },
    mounted() {
      const refreshStats = async () => {
        try {
          this.stats = await window.electronApi.invoke('stats.get_timer_stats')
          this.pickupCounts = await window.electronApi.invoke('stats.get_pickup_counts')

          this.statsLive = true
          this.statsLoadedOnce = true
        } catch (e) {
          console.error(e)
          this.statsLive = false
        }

        this.refreshTimeoutId = setTimeout(refreshStats, 500)
      }

      refreshStats()
    },
    beforeDestroy() {
      if (this.refreshTimeoutId) {
        clearTimeout(this.refreshTimeoutId)
      }
    },
    methods: {
      async screenshotAndCopy(node) {
        this.screenshotLoading = true

        try {
          await navigator.clipboard?.write([
            new ClipboardItem({
              'image/png': await toBlob(node, {
                backgroundColor: '#000000',
              }),
            }),
          ])

          this.screenshotCopied = true
          setTimeout(() => {
            this.screenshotCopied = false
          }, 3000)
        } catch (e) {
          console.error(e)
        }

        this.screenshotLoading = false
      },
      getZoneTimePercentage(zoneId) {
        return ((this.stats.save.area_stats[zoneId]?.time_spent ?? 0) / this.stats.save.total_time) * 100
      },
      calculatePPM(pickups, totalSeconds) {
        const minutes = totalSeconds / 60
        if (totalSeconds <= 10 || pickups <= 0) {
          return '-'
        }
        return (pickups / minutes).toFixed(1)
      },
      formatTime,
    },
  }
</script>

<style lang="scss" scoped>
  .single-game-stats {
    max-width: 1100px;
  }

  .stats-container {
    row-gap: 1em;
    column-gap: 2em;
  }

  .global-stats {
    font-size: 1.2em;
  }

  .stat-heading {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.85em;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    align-self: end;
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

        &.both-sides {
          background: linear-gradient(to right, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 75%, rgba(0, 0, 0, 0.8) 100%);
        }
      }

      &.gradient-y-overlay {
        background: linear-gradient(
          to bottom,
          rgba(0, 0, 0, 0.7) 0%,
          rgba(0, 0, 0, 0) 40%,
          rgba(0, 0, 0, 0) 60%,
          rgba(0, 0, 0, 0.7) 100%
        );
      }
    }

    .stats-content {
      position: relative;
      z-index: 10;
    }
  }

  .global-stats {
    background-color: black;

    .max-ppm-time {
      font-size: 0.7em;
      letter-spacing: 0;
    }

    .background {
      object-fit: scale-down;
      object-position: bottom right;
    }
  }

  .ability-timeline > * {
    z-index: 2;
  }

  .area-stats-container {
    display: grid;
    grid-template-columns: 50% 50%;
    grid-auto-flow: column;

    @media (max-width: 1264px) {
      grid-template-columns: 100%;
      grid-auto-flow: row;
    }

    .area-name {
      margin-left: auto;
    }
  }

  .semitransparent {
    opacity: 0.6;
  }
</style>
