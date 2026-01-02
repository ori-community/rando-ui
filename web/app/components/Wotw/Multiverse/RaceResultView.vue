<template>
  <div>
    <h2 class="text-right mb-4">Race result</h2>

    <transition-group class="teams" name="list">
      <div
        v-for="(team, index) in sortedRaceTeams"
        :key="team.id"
        class="team"
      >
        <place-badge :place="team.finishedTime === 0.0 ? 'F' : index + 1"/>
        <v-card
          color="background lighten-1"
          elevation="0"
          class="pa-4"
        >
          <div class="team-members">
            <div v-for="member in team.members" :key="member.user.id" class="team-member">
              <wotw-player-view :user="member.user"/>
              <div class="member-time">{{ member.finishedTime !== 0.0 ? formatTime(member.finishedTime) : 'DNF' }}</div>
            </div>
          </div>

          <div class="team-info mt-5">
            <div v-if="team.members.length > 1" class="team-time">
              {{ team.finishedTime !== 0.0 ? formatTime(team.finishedTime) : 'DNF' }}
            </div>
          </div>
        </v-card>
      </div>
    </transition-group>
  </div>
</template>

<script lang="ts" setup>
  import type {RaceInfo} from "@shared/proto/messages";

  const props = defineProps<{
    race: RaceInfo,
  }>()

  const sortedRaceTeams = computed(() => {
    const teams = structuredClone(props.race.teams)

    const compareFinishedTime = (a: number | null | undefined, b: number | null | undefined) => {
      if (a === 0.0 || a === null || a === undefined) {
        return 1
      }

      if (b === 0.0 || b === null || b === undefined) {
        return -1
      }

      return a - b
    }

    teams.sort((a, b) => compareFinishedTime(a.finishedTime, b.finishedTime))

    for (const team of teams) {
      team.members.sort((a, b) => compareFinishedTime(a.finishedTime, b.finishedTime))
    }

    return teams
  })

</script>

<style lang="scss" scoped>
  .teams {
    display: flex;
    flex-direction: column;
    gap: 0.5em;

    .team {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 0.4em;
      align-items: flex-start;

      .team-members {
        display: flex;
        flex-direction: column;
        gap: 0.5em;

        .team-member {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 3em;

          .member-time {
            opacity: 0.5;
          }
        }
      }

      .team-info {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;

        .team-time {
          text-align: right;
          font-size: 1.5em;
          line-height: 1.0;
        }
      }
    }
  }
</style>
