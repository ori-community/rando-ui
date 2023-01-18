<template>
  <div>
    <h2 class="text-right mb-4">Race result</h2>

    <transition-group class="teams" name="list">
      <div
        v-for="(team, index) in sortedRaceTeams"
        :key="team.id"
        class="team"
      >
        <place-badge :place="index + 1" />
        <v-card
          color="background lighten-1"
          elevation="0"
          class="pa-4"
        >
          <div class="team-members">
            <div v-for="member in team.members" :key="member.user.id" class="team-member">
              <wotw-player-view :user="member.user" with-points />
              <div class="member-time">{{ formatTime(member.finishedTime) }}</div>
            </div>
          </div>

          <div class="team-info mt-5">
            <div>
              <wotw-experience-points class="points">+{{ team.points }}</wotw-experience-points>
            </div>
            <div v-if="team.members.length > 1" class="team-time">{{ formatTime(team.finishedTime) }}</div>
          </div>
        </v-card>
      </div>
    </transition-group>
  </div>
</template>

<script>
  import cloneDeep from 'lodash.clonedeep'
  import { formatTime } from '../assets/lib/formatTime'

  export default {
    name: 'WotwRaceResultView',
    props: {
      race: {
        type: Object,
        required: true,
      },
    },
    computed: {
      sortedRaceTeams() {
        const teams = cloneDeep(this.race.teams)

        teams.sort((a, b) => a.finishedTime - b.finishedTime)

        for (const team of teams) {
          team.members.sort((a, b) => a.finishedTime - b.finishedTime)
        }

        return teams
      }
    },
    methods: { formatTime },
  }
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

        .points {
          font-size: 1.2em;
        }

        .team-time {
          text-align: right;
          font-size: 1.5em;
          line-height: 1.0;
        }
      }
    }
  }
</style>
