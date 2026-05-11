<template>
  <v-container>
    <div class="mb-6">
      <h2>Create League Season</h2>

      <v-row>
        <v-col cols="4">
          <v-text-field v-model="createName" label="Name" />
        </v-col>
        <v-col cols="4">
          <v-text-field v-model="createCron" label="Cron" />
        </v-col>
        <v-col cols="4">
          <v-text-field v-model="createGameCount" type="number" label="Game count" />
        </v-col>
        <v-col cols="12">
          <v-text-field v-model="createShortDescription" label="Short Description" />
        </v-col>
        <v-col cols="12">
          <v-textarea v-model="createLongDescriptionMarkdown" auto-grow label="Long Description (Markdown)" />
        </v-col>
        <v-col cols="12">
          <v-textarea v-model="createRulesMarkdown" auto-grow label="Rules (Markdown)" />
        </v-col>
        <v-col cols="12">
          <v-text-field v-model="createBackgroundImageUrl" label="Background Image URL (optional)" />
        </v-col>
      </v-row>

      <v-btn color="accent" @click="create">
        Create Season
      </v-btn>
    </div>
    <div class="mb-6">
      <h2>Force Continue League Season</h2>

      <v-row>
        <v-col cols="12">
          <v-text-field v-model="seasonId" type="number" label="Season ID" />
        </v-col>
      </v-row>

      <v-btn class="mr-1" color="accent" @click="forceContinue">
        Force Continue
      </v-btn>
      <v-btn color="accent" @click="recalculateSingleLeaderboard">
        Recalculate Leaderboard
      </v-btn>
    </div>
    <div class="mb-6">
      <h2>Recalculate all Leaderboards</h2>

      <v-btn color="accent" @click="recalculateLeaderboards">
        Recalculate
      </v-btn>
    </div>
  </v-container>
</template>

<script lang="ts" setup>

  const router = useRouter()
  const {axios} = useAxios()
      const createName = ref('My League Season')
      const createCron = ref('*/10 * * * *')
      const createGameCount = ref(3)
      const createShortDescription = ref('Test League, Gorlek, All Trees')
      const createLongDescriptionMarkdown = ref('Welcome to the *Test League*.\nWhat you can expect here:\n- Fun\n- Bugs\n- even more Fun')
      const createRulesMarkdown = ref('1. Do not cheat\n2. If you do, uninstall the game immediately')
      const universePreset = ref("{}")
      const createBackgroundImageUrl = ref('')
      const seasonId = ref(0)


      const create = ( async () => {
        try {
          const seasonId = (await axios.post('/dev/league/season', {
            name: createName.value,
            cron: createCron.value,
            gameCount: createGameCount.value,
            shortDescription: createShortDescription.value,
            longDescriptionMarkdown: createLongDescriptionMarkdown.value,
            rulesMarkdown: createRulesMarkdown.value,
            universePreset: universePreset.value,
            backgroundImageUrl: createBackgroundImageUrl.value,
          })).data

          await router.push({name: 'league-seasons-seasonId', params: {seasonId: seasonId}})
        } catch (e) {
          alert(e)
          console.error(e)
        }
      })
      const forceContinue = (async () => {
        try {
          await axios.post(`/dev/league/season/${seasonId.value}/continue`)
          alert("Successfully continued season")
        } catch (e) {
          alert(e)
          console.error(e)
        }
      })

      const recalculateSingleLeaderboard = (async () => {
        try {
          await axios.post(`/dev/league/season/${seasonId.value}/recalculate-points`)
          alert("Successfully recalculated leaderboard")
        } catch (e) {
          alert(e)
          console.error(e)
        }
      })
      const recalculateLeaderboards = (async () => {
        try {
          await axios.post(`/dev/league/season/recalculate-points`)
          alert("Successfully recalculated all leaderboards")
        } catch (e) {
          alert(e)
          console.error(e)
        }
      })
</script>

<style lang="scss" scoped>

</style>
