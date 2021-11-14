<template>
  <v-card max-width='1000'>
    <div class='global-stats pa-5 py-8'>
      <img class='background' :src='require(`@/assets/images/ori_running.png`)' alt=''>
      <div class='gradient-overlay gradient-x-overlay'></div>
      <div class='stats-content'>
        <h1 class='stat-heading'>Global Stats</h1>
        <div class=' d-flex flex-wrap stats-container'>
          <wotw-stats-singlestat-view label='Time' text='1:35:02.49' />
          <wotw-stats-singlestat-view label='Deaths' text='16' />
          <wotw-stats-singlestat-view label='Warps used' text='9' />
          <wotw-stats-singlestat-view label='PPM' text='3.8' />
          <wotw-stats-singlestat-view label='Peak PPM'>
            9.6 <small>at 12:09.16</small>
          </wotw-stats-singlestat-view>
          <wotw-stats-singlestat-view
            :progress='299 / 357'
            text='299 / 357'
            label='Pickups'
          />
        </div>
      </div>
    </div>

    <div>
      <div v-for='zone in zones' :key='zone.id' class='area-stats pa-5'>
        <div class='gradient-overlay gradient-x-overlay'></div>
        <div class='gradient-overlay gradient-y-overlay'></div>
        <img class='background' :src='require(`@/assets/images/areas/${zone.id}.jpg`)' alt=''>
        <div class='stats-content'>
          <h3 class='stat-heading'>{{ zone.name }}</h3>
          <div class='d-flex flex-wrap stats-container mb-1'>
            <wotw-stats-singlestat-view label='Time' text='1:35:02.49' />
            <wotw-stats-singlestat-view label='Deaths' text='16' />
            <wotw-stats-singlestat-view label='PPM' text='3.8' />
          </div>
          <v-progress-linear value='66' />
        </div>
      </div>
    </div>
  </v-card>
</template>

<script>
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
      zones,
    }),
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
