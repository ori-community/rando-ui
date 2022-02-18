<template>
  <div v-if='connected' class='tracker pa-3'>
    <WotwTrackerSkillView skill='hammer' :active='trackedValues.skill_hammer' />
    <WotwTrackerSkillView skill='sentry' :active='trackedValues.skill_sentry' />
    <WotwTrackerSkillView skill='flap' :active='trackedValues.skill_flap' />
    <WotwTrackerSkillView skill='blaze' :active='trackedValues.skill_blaze' />
    <WotwTrackerSkillView class='clean-water' skill='clean_water' :active='trackedValues.skill_clean_water' />
    <WotwTrackerResourceView class='resource-view' />
    <WotwTrackerSkillView skill='spike' :active='trackedValues.skill_spike' />
    <WotwTrackerSkillView skill='shuriken' :active='trackedValues.skill_shuriken' />
    <WotwTrackerSkillView skill='glide' :active='trackedValues.skill_glide' />
    <WotwTrackerSkillView skill='water_breath' :active='trackedValues.skill_water_breath' />

    <WotwTrackerSkillView skill='sword' :tree='trackedValues.tree_sword' :active='trackedValues.skill_sword' />
    <WotwTrackerSkillView skill='bash' :tree='trackedValues.tree_bash' :active='trackedValues.skill_bash' />
    <WotwTrackerSkillView skill='bow' :tree='trackedValues.tree_bow' :active='trackedValues.skill_bow' />
    <WotwTrackerSkillView skill='burrow' :tree='trackedValues.tree_burrow' :active='trackedValues.skill_burrow' />
    <WotwTrackerSkillView skill='dash' :tree='trackedValues.tree_dash' :active='trackedValues.skill_dash' />
    <WotwTrackerSkillView skill='double_jump' :tree='trackedValues.tree_double_jump' :active='trackedValues.skill_double_jump' />
    <WotwTrackerSkillView skill='ancestral_light_glades' :tree='trackedValues.tree_ancestral_light_glades' :active='trackedValues.skill_ancestral_light_glades' />
    <WotwTrackerSkillView skill='flash' :tree='trackedValues.tree_flash' :active='trackedValues.skill_flash' />
    <WotwTrackerSkillView skill='grapple' :tree='trackedValues.tree_grapple' :active='trackedValues.skill_grapple' />
    <WotwTrackerSkillView skill='launch' :tree='trackedValues.tree_launch' :active='trackedValues.skill_launch' />
    <WotwTrackerSkillView skill='light_burst' :tree='trackedValues.tree_light_burst' :active='trackedValues.skill_light_burst' />
    <WotwTrackerSkillView skill='regenerate' :tree='trackedValues.tree_regenerate' :active='trackedValues.skill_regenerate' />
    <WotwTrackerSkillView skill='water_dash' :tree='trackedValues.tree_water_dash' :active='trackedValues.skill_water_dash' />
    <WotwTrackerSkillView skill='ancestral_light_marsh' :tree='trackedValues.tree_ancestral_light_marsh' :active='trackedValues.skill_ancestral_light_marsh' />
  </div>
</template>

<script>
  import { decodePacket } from '~/assets/proto/ProtoUtil'
  import { ResetTracker, TrackerUpdate } from '~/assets/proto/messages'
  import { applyOBSStyles, isOBS } from '~/assets/lib/obs'

  export default {
    name: 'Tracker',
    layout: 'plain',
    data: () => ({
      connected: false,
      trackedValues: {},
    }),
    computed: {
      trackerSource() {
        return this.$route.query.source
      }
    },
    mounted() {
      if (isOBS()) {
        applyOBSStyles()
      }

      this.connect()
    },
    methods: {
      connect() {
        const ws = new WebSocket(this.trackerSource)

        ws.addEventListener('open', () => {
          this.connected = true
        })
        ws.addEventListener('message', async event => {
          const packet = await decodePacket(event.data)

          if (!packet) {
            return
          }

          switch (packet.$type) {
            case TrackerUpdate.$type:
              this.$set(this.trackedValues, packet.id, packet.value)
              break
            case ResetTracker.$type:
              this.trackedValues = {}
              break
          }
        })
      }
    }
  }
</script>

<style lang='scss' scoped>
  .tracker {
    display: grid;
    grid-template-columns: repeat(7, 1fr);

    .clean-water {
      grid-column: 5;
      grid-row: 1 / span 2;
    }

    .resource-view {
      grid-column: 6 / span 2;
      grid-row: 1 / span 2;
    }
  }
</style>
