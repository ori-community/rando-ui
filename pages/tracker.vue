<template>
  <div class='fill-height'>
    <v-fade-transition mode='out-in'>
      <div v-if='connected' key='tracker' class='tracker pa-2'>
        <WotwTrackerSkillView skill='spike' :active='trackedValues.skill_spike' />
        <WotwTrackerSkillView skill='sentry' :active='trackedValues.skill_sentry' />
        <WotwTrackerSkillView skill='blaze' :active='trackedValues.skill_blaze' />
        <WotwTrackerSkillView skill='flap' :active='trackedValues.skill_flap' />
        <WotwTrackerSkillView class='clean-water' skill='clean_water' :active='trackedValues.skill_clean_water' />
        <WotwTrackerResourceView
          class='resource-view'
          :flags='seedFlags'
          :spirit-light='trackedValues.resource_spirit_light'
          :gorlek-ore='trackedValues.resource_gorlek_ore'
          :keystones='trackedValues.resource_keystones'
        />
        <WotwTrackerSkillView skill='hammer' :active='trackedValues.skill_hammer' />
        <WotwTrackerSkillView skill='shuriken' :active='trackedValues.skill_shuriken' />
        <WotwTrackerSkillView skill='water_breath' :active='trackedValues.skill_water_breath' />
        <WotwTrackerSkillView skill='glide' :active='trackedValues.skill_glide' />

        <WotwTrackerSkillView skill='sword' :tree='trackedValues.tree_sword' :active='trackedValues.skill_sword' />
        <WotwTrackerSkillView skill='bash' :tree='trackedValues.tree_bash' :active='trackedValues.skill_bash' />
        <WotwTrackerSkillView skill='bow' :tree='trackedValues.tree_bow' :active='trackedValues.skill_bow' />
        <WotwTrackerSkillView skill='dash' :tree='trackedValues.tree_dash' :active='trackedValues.skill_dash' />
        <WotwTrackerSkillView skill='water_dash' :tree='trackedValues.tree_water_dash' :active='trackedValues.skill_water_dash' />
        <WotwTrackerSkillView skill='burrow' :tree='trackedValues.tree_burrow' :active='trackedValues.skill_burrow' />
        <WotwTrackerSkillView skill='ancestral_light_glades' :tree='trackedValues.tree_ancestral_light_glades' :active='trackedValues.skill_ancestral_light_glades' />
        <WotwTrackerSkillView skill='double_jump' :tree='trackedValues.tree_double_jump' :active='trackedValues.skill_double_jump' />
        <WotwTrackerSkillView skill='regenerate' :tree='trackedValues.tree_regenerate' :active='trackedValues.skill_regenerate' />
        <WotwTrackerSkillView skill='grapple' :tree='trackedValues.tree_grapple' :active='trackedValues.skill_grapple' />
        <WotwTrackerSkillView skill='launch' :tree='trackedValues.tree_launch' :active='trackedValues.skill_launch' />
        <WotwTrackerSkillView skill='flash' :tree='trackedValues.tree_flash' :active='trackedValues.skill_flash' />
        <WotwTrackerSkillView skill='light_burst' :tree='trackedValues.tree_light_burst' :active='trackedValues.skill_light_burst' />
        <WotwTrackerSkillView skill='ancestral_light_marsh' :tree='trackedValues.tree_ancestral_light_marsh' :active='trackedValues.skill_ancestral_light_marsh' />
      </div>
      <div v-else-if='!hideConnectingScreen' key='connecting' class='fill-height d-flex flex-column align-center justify-center'>
        <div class='pb-4'>
          <template v-if='connectedOnce'>
            Connection lost. Trying to reconnect...
          </template>
          <template v-else>
            Waiting for game...
          </template>
        </div>
        <v-progress-circular indeterminate />
      </div>
    </v-fade-transition>
  </div>
</template>

<script>
  import { decodePacket } from '~/assets/proto/ProtoUtil'
  import { ResetTracker, TrackerFlagsUpdate, TrackerUpdate } from '~/assets/proto/messages'
  import { applyOBSStyles, isOBS } from '~/assets/lib/obs'

  export default {
    name: 'Tracker',
    layout: 'plain',
    data: () => ({
      connected: false,
      connectedOnce: false,
      hideConnectingScreen: false,
      trackedValues: {},
      seedFlags: [],
    }),
    head: {
      title: 'Item Tracker',
    },
    computed: {
      trackerSource() {
        return this.$route.query.source
      },
      isOBS,
    },
    watch: {
      connected: {
        immediate: true,
        handler(newValue) {
          if (!newValue && isOBS()) {
            setTimeout(() => {
              this.hideConnectingScreen = true
            }, 5000)
          } else if (newValue) {
            this.hideConnectingScreen = false
          }
        }
      },
    },
    mounted() {
      if (isOBS()) {
        applyOBSStyles()
      }

      this.connect()

      // pagchimp
      document.documentElement.style.overflow = 'hidden'
    },
    beforeDestroy() {
      this.tryDisconnect()
    },
    methods: {
      connect() {
        console.log(`tracker: Trying to connect to ${this.trackerSource}...`)

        this.tryDisconnect()
        this.ws = new WebSocket(this.trackerSource)

        this.ws.addEventListener('close', () => {
          console.log(`tracker: Connection lost. Will retry in 2s...`)
          this.connected = false
          setTimeout(this.connect, 2000)
        })

        this.ws.addEventListener('open', () => {
          console.log(`tracker: Connected`)
          this.connected = true
          this.connectedOnce = true
        })
        this.ws.addEventListener('message', async event => {
          const packet = await decodePacket(event.data)

          if (!packet) {
            return
          }

          switch (packet.$type) {
            case TrackerUpdate.$type:
              this.$set(this.trackedValues, packet.id, packet.value)
              break
            case TrackerFlagsUpdate.$type:
              this.seedFlags = packet.flags
              break
            case ResetTracker.$type:
              this.trackedValues = {}
              this.seedFlags = []
              break
          }
        })
      },
      tryDisconnect() {
        try {
          this.ws?.close()
        } catch (e) {
          console.error(e)
        }
      },
    }
  }
</script>

<style lang='scss' scoped>
  .tracker {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    width: 100vw;
    height: calc(4 / 7 * 100vw);

    > * {
      min-width: 0;
      min-height: 0;
    }

    .clean-water {
      grid-column: 5;
      grid-row: 1 / span 2;
    }

    .resource-view {
      grid-column: 6 / span 2;
      grid-row: 1 / span 2;
      position: relative;
    }
  }
</style>
