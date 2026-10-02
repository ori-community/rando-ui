<template>
  <div>
    <h3 class="mb-1">General</h3>

    <v-row>
      <v-col cols="12" md="6" class="mb-4">
        <v-autocomplete
          v-model="model.spawn"
          :items="availableSpawnListItems"
          label="Spawn"
          prepend-inner-icon="mdi-map-marker-radius-outline"
        />
        <v-switch
          v-model="randomizeEntrancesBoolean"
          label="Randomize Entrances"
          color="secondary"
          hide-details
          inset
        />
      </v-col>
      <v-col cols="12" md="6" class="mb-4">
        <v-select
          v-model="model.difficulty"
          :items="availableDifficultyListItems"
          label="Logic Difficulty"
          prepend-inner-icon="mdi-routes"
        />

        <v-card variant="tonal" class="justify-start activated-opacity-input-field" block size="xl" @click="gameDifficultiesDialogOpen = true">
          <div class="pa-3 d-flex align-center justify-start text-left ga-1">
            <v-icon class="flex-shrink-0 opacity-70">mdi-gauge</v-icon>
            <div class="pl-1 flex-grow-1">
              <div class="text-label-medium opacity-70">
                Game Difficulties:
              </div>
              <div>
                {{ selectedDifficultyNames.length > 0 ? selectedDifficultyNames.join(" / ") : "-" }}
                <em v-if="model.gameDifficulties.onlyShowSelected">(Enforced)</em>
              </div>
            </div>
            <v-icon class="opacity-70">mdi-chevron-right</v-icon>
          </div>
        </v-card>
        <v-dialog v-model="gameDifficultiesDialogOpen" max-width="750" :persistent="selectedDifficultyNames.length === 0">
          <v-card title="Game Difficulties">
            <v-card-text>
              Select at least one difficulty the generated seed should be playable on.

              <v-switch v-model="model.gameDifficulties.easy" color="secondary" inset hide-details>
                <template #label>
                  <div>
                    <div>Easy</div>
                    <div class="text-label-large opacity-70">Hit damage is halved, enemies have less health</div>
                  </div>
                </template>
              </v-switch>
              <v-switch v-model="model.gameDifficulties.normal" color="secondary" inset hide-details>
                <template #label>
                  <div>
                    <div>Normal</div>
                    <div class="text-label-large opacity-70">The way the game was meant to be played</div>
                  </div>
                </template>
              </v-switch>
              <v-switch v-model="model.gameDifficulties.hard" color="secondary" inset hide-details>
                <template #label>
                  <div>
                    <div>Hard</div>
                    <div class="text-label-large opacity-70">Hit damage is doubled, enemies have more health. Stronger enemies spawn in some places.</div>
                  </div>
                </template>
              </v-switch>
              <v-divider class="my-5" />
              <v-switch v-model="model.gameDifficulties.onlyShowSelected" color="secondary" inset hide-details>
                <template #label>
                  <div>
                    <div>Enforce selected Difficulties</div>
                    <div class="text-label-large opacity-70">Restricts selectable difficulties to the ones above in the game's main menu</div>
                  </div>
                </template>
              </v-switch>
            </v-card-text>
            <v-btn :disabled="selectedDifficultyNames.length === 0" class="close-button" icon variant="plain" @click="gameDifficultiesDialogOpen = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>

    <v-combobox
      v-model="model.tricks"
      multiple
      :items="availableTrickListItems"
      closable-chips
      label="Tricks"
      :placeholder="anyTricksAvailableWithSelectedLogicDifficulty ? 'None' : 'No Tricks available with selected Logic Difficulty'"
      persistent-placeholder
      prepend-inner-icon="mdi-transit-detour"
      chips
      :return-object="false"
      :disabled="!anyTricksAvailableWithSelectedLogicDifficulty"
      glow
    >
      <template v-if="anyTricksAvailableWithSelectedLogicDifficulty" #append-inner>
        <v-btn v-if="allAvailableTricksSelected" variant="tonal" @mousedown.stop @click="toggleAllAvailableTricks()">
          <v-icon start>mdi-close-box-multiple-outline</v-icon>
          Disable All
        </v-btn>
        <v-btn v-else variant="tonal" @mousedown.stop @click="toggleAllAvailableTricks()">
          <v-icon start>mdi-checkbox-multiple-outline</v-icon>
          Enable All
        </v-btn>
      </template>
    </v-combobox>

    <div class="snippets-grid gap-12">
      <div v-for="category in sortedSnippetCategories" :key="category">
        <h3 class="mb-1">{{ category }}</h3>

        <div class="snippets">
          <wotw-seedgen-snippet-toggle
            v-for="snippet in categorizedSnippetsInfo[category]"
            :key="snippet.identifier"
            v-model:world-snippets="model.snippets"
            v-model:world-snippet-config="model.snippetConfig"
            :snippet-identifier="snippet.identifier"
            :snippet-info="snippet.snippetInfo"
          />
        </div>
      </div>
    </div>

    <v-dialog v-model="tricksInvalidBecauseOfDifficultyChangeDialogOpen" persistent max-width="650">
      <v-card title="Invalid Tricks selected">
        <v-card-text>
          The following tricks are ineffective on the newly selected Logic Difficulty:
          <ul class="my-2">
            <li v-for="trick in invalidSelectedTricks" :key="trick">{{ formatTrickName(trick) }}</li>
          </ul>
          Do you want to deselect these tricks?
        </v-card-text>
        <div class="ma-3 d-flex justify-end gap-4">
          <v-btn prepend-icon="mdi-close" variant="tonal" @click="tricksInvalidBecauseOfDifficultyChangeDialogOpen = false">Cancel</v-btn>
          <v-btn prepend-icon="mdi-checkbox-blank-off-outline" color="error" flat @click="cleanInvalidTricks()">Deselect {{ invalidSelectedTricks.size }} Trick{{ invalidSelectedTricks.size === 1 ? '' : 's' }}</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
  import {useVModel} from '@vueuse/core'
  import type {
    Difficulty,
    DifficultyInfo,
    HashMapStringSchemaResultSnippetInfoString,
    SnippetInfo,
    Trick,
    TrickInfo,
    WorldSettings,
  } from "@shared/types/seedgen"

  const props = defineProps<{
    modelValue: WorldSettings,
    snippetsInfo: HashMapStringSchemaResultSnippetInfoString,
    difficulties: DifficultyInfo[],
    tricks: TrickInfo[],
  }>()

  const emits = defineEmits<{
    "update:modelValue": [WorldSettings],
  }>()

  const model = useVModel(props, "modelValue", emits)

  const invalidSelectedTricks = ref<Set<string>>(new Set())
  const tricksInvalidBecauseOfDifficultyChangeDialogOpen = ref(false)
  const difficultyToSwitchToWhenConfirmingTrickCleanup = ref<Difficulty>("Moki")
  const gameDifficultiesDialogOpen = ref(false)

  const validSnippetsInfo = computed(() => Object.fromEntries(Object.entries(props.snippetsInfo).filter(([, e]) => e.status === "Ok")) as {[key: string]: Extract<HashMapStringSchemaResultSnippetInfoString[string], { status: "Ok" }>})
  const visibleSnippetsInfo = computed(() => Object.fromEntries(Object.entries(validSnippetsInfo.value).filter(([, e]) => !e.metadata.hidden)))
  const categorizedSnippetsInfo = computed(() => {
    const categories: {[categoryName: string]: {identifier: string, snippetInfo: SnippetInfo}[]} = {}

    for (const [identifier, snippetInfo] of Object.entries(visibleSnippetsInfo.value)) {
      const categoryName = snippetInfo.metadata.category ?? "Uncategorized"

      if (!Object.hasOwn(categories, categoryName)) {
        categories[categoryName] = []
      }

      categories[categoryName]?.push({
        identifier,
        snippetInfo,
      })
    }

    return categories
  })
  const wellKnownSnippetCategories = ["Goals", "Hints", "Item Pool", "World Changes", "Placements", "Quality of Life", "Gameplay"]
  const sortedSnippetCategories = computed(() => {
    // Sort by wellKnownSnippetCategories, or alphabetically if unknown

    const categories = Object.keys(categorizedSnippetsInfo.value)

    categories.sort((a, b) => {
      const aValue = wellKnownSnippetCategories.indexOf(a)
      const bValue = wellKnownSnippetCategories.indexOf(b)

      if (aValue === -1 && bValue !== -1) {
        return 1
      }

      if (aValue !== -1 && bValue === -1) {
        return -1
      }

      if (aValue === -1 && bValue === -1) {
        return a.localeCompare(b)
      }

      return aValue - bValue
    })

    return categories
  })
  const selectedDifficultyNames = computed(() => {
    const names = []
    if (model.value.gameDifficulties.easy) {
      names.push("Easy")
    }
    if (model.value.gameDifficulties.normal) {
      names.push("Normal")
    }
    if (model.value.gameDifficulties.hard) {
      names.push("Hard")
    }
    return names
  })

  // TODO: Fetch from seedgen once API exists
  const availableSpawnListItems = [
    {title: "Random Teleporter", value: "Random", props: {prependIcon: "mdi-map-marker-question-outline"}},
    {title: "Random Position", value: "FullyRandom", props: {prependIcon: "mdi-shuffle"}},
    {title: "Inkwater Marsh Teleporter", value: {Set: "MarshSpawn.Main"}, props: {prependIcon: "mdi-map-marker-outline"}},
    {title: "Willow's End Teleporter", value: {Set: "WillowsEnd.TP"}, props: {prependIcon: "mdi-map-marker-outline"}},
  ]

  const availableDifficultyListItems = computed(() => props.difficulties.map(difficultyInfo => ({
    title: difficultyInfo.name,
    value: difficultyInfo.name,
    props: {
      subtitle: difficultyInfo.description,
    },
  })))

  const difficultyOrderByName = computed(() => {
    const difficultyOrderByName: {[key in Difficulty]?: number} = {}

    props.difficulties.forEach((difficultyInfo, index) => {
      difficultyOrderByName[difficultyInfo.name] = index
    })

    return difficultyOrderByName
  })

  const trickByName = computed(() => {
    const trickByName: {[key in Trick]?: TrickInfo} = {}

    for (const trickInfo of props.tricks) {
      trickByName[trickInfo.name] = trickInfo
    }

    return trickByName
  })

  function getDifficultyOrder(difficulty?: Difficulty) {
    if (difficulty === undefined) {
      return -1
    }

    return difficultyOrderByName.value[difficulty] ?? -1
  }

  const availableTricks = computed(() => {
    const selectedDifficultyOrder = getDifficultyOrder(model.value.difficulty)
    return props.tricks.filter(trickInfo => getDifficultyOrder(trickInfo.minDifficulty) <= selectedDifficultyOrder).map(trickInfo => trickInfo.name)
  })

  /**
   * Formats trick names, e.g.
   * SentryJump -> Sentry Jump
   */
  function formatTrickName(trickName: string) {
    return trickName.replaceAll(/(.)([A-Z])/g, "$1 $2")
  }

  const availableTrickListItems = computed(() => {
    const selectedDifficultyOrder = getDifficultyOrder(model.value.difficulty)

    return props.tricks
      .map(trickInfo => {
        const disabled = getDifficultyOrder(trickInfo.minDifficulty) > selectedDifficultyOrder

        return {
          title: formatTrickName(trickInfo.name),
          value: trickInfo.name,
          props: {
            disabled,
            subtitle: disabled
              ? `Available in ${trickInfo.minDifficulty} or higher. ${trickInfo.description}`
              : trickInfo.description,
          },
        }
      })
      .sort((a, b) => {
        if (a.props.disabled !== b.props.disabled) {
          return (a.props.disabled ? 1 : 0) - (b.props.disabled ? 1 : 0)
        }

        if (a.props.disabled) {
          const difficultyCompare = getDifficultyOrder(trickByName.value[a.value]?.minDifficulty) - getDifficultyOrder(trickByName.value[b.value]?.minDifficulty)

          if (difficultyCompare !== 0) {
            return difficultyCompare
          }
        }

        return a.title.localeCompare(b.title)
      })
  })

  const anyTricksAvailableWithSelectedLogicDifficulty = computed(() => availableTrickListItems.value.some(i => !i.props.disabled))

  watch(() => model.value.difficulty, (value, oldValue) => {
    const newDifficultyOrder = getDifficultyOrder(value)
    const oldDifficultyOrder = getDifficultyOrder(oldValue)

    if (newDifficultyOrder >= oldDifficultyOrder) {
      return
    }

    invalidSelectedTricks.value = new Set(model.value.tricks.filter(trick => getDifficultyOrder(trickByName.value[trick]?.minDifficulty) > newDifficultyOrder))
    if (invalidSelectedTricks.value.size > 0) {
      tricksInvalidBecauseOfDifficultyChangeDialogOpen.value = true
      difficultyToSwitchToWhenConfirmingTrickCleanup.value = value
      model.value.difficulty = oldValue
    }
  })

  function cleanInvalidTricks() {
    model.value.tricks = model.value.tricks.filter(trick => !invalidSelectedTricks.value.has(trick))
    tricksInvalidBecauseOfDifficultyChangeDialogOpen.value = false
    model.value.difficulty = difficultyToSwitchToWhenConfirmingTrickCleanup.value
  }

  const randomizeEntrancesBoolean = computed<boolean>({
    get() {
      return !!model.value.randomizeEntrances
    },
    set(value) {
      model.value.randomizeEntrances = value ? 2 : null
    }
  })

  const allAvailableTricksSelected = computed(() => {
    if (model.value.tricks.length === 0) {
      return false
    }

    const selectedTricksSet = new Set(model.value.tricks)
    return selectedTricksSet.isSupersetOf(new Set(availableTricks.value))
  })

  function toggleAllAvailableTricks() {
    if (allAvailableTricksSelected.value) {
      model.value.tricks = []
    } else {
      model.value.tricks = availableTricks.value
    }
  }
</script>

<style lang="scss" scoped>
  .snippets-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));

    .snippets {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5em;
    }
  }

  .close-button {
    position: absolute;
    right: 1em;
    top: 1em;
    z-index: 10;
  }

  .activated-opacity-input-field {
    --v-activated-opacity: 0.04;
  }
</style>
