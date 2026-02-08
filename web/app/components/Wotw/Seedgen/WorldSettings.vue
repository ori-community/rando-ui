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
          v-model="randomizeDoorsBoolean"
          label="Randomize Entrances"
          color="secondary"
          hide-details
          inset
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-autocomplete
          v-model="model.difficulty"
          :items="availableDifficultyListItems"
          label="Logic Difficulty"
          prepend-inner-icon="mdi-gauge"
        />
        <v-switch
          v-model="model.hard"
          v-tooltip="{
            openDelay: 500,
            text: 'This is the game difficulty that you select when creating a new save file in-game.',
            maxWidth: 400,
            contentClass: 'bg-surface-light',
            target: 'cursor',
          }"
          label="Play on Hard Game Difficulty"
          color="secondary"
          hide-details
          inset
        />
      </v-col>
    </v-row>

    <v-combobox
      v-model="model.tricks"
      multiple
      :items="availableTrickListItems"
      closable-chips
      label="Tricks"
      placeholder="None"
      persistent-placeholder
      prepend-inner-icon="mdi-transit-detour"
      chips
      :return-object="false"
      :append-inner-icon="allAvailableTricksSelected ? 'mdi-close-box-multiple-outline' : 'mdi-checkbox-multiple-outline'"
      glow
      @click:append-inner="toggleAllAvailableTricks()"
    />

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
            :snippet-metadata="snippet.metadata"
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
    HashMapStringMetadata,
    Metadata,
    Trick,
    TrickInfo,
    WorldSettings,
  } from '@shared/types/seedgen'

  const props = defineProps<{
    modelValue: WorldSettings,
    snippetsInfo: HashMapStringMetadata,
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

  const visibleSnippetsInfo = computed(() => Object.fromEntries(Object.entries(props.snippetsInfo).filter(([, e]) => !e.hidden)))
  const categorizedSnippetsInfo = computed(() => {
    const categories: {[categoryName: string]: {identifier: string, metadata: Metadata}[]} = {}

    for (const [identifier, metadata] of Object.entries(visibleSnippetsInfo.value)) {
      const categoryName = metadata.category ?? "Uncategorized"

      if (!Object.hasOwn(categories, categoryName)) {
        categories[categoryName] = []
      }

      categories[categoryName]?.push({
        identifier,
        metadata,
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
    return props.tricks.filter(trickInfo => getDifficultyOrder(trickInfo.min_difficulty) <= selectedDifficultyOrder).map(trickInfo => trickInfo.name)
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
        const disabled = getDifficultyOrder(trickInfo.min_difficulty) > selectedDifficultyOrder

        return {
          title: formatTrickName(trickInfo.name),
          value: trickInfo.name,
          props: {
            disabled,
            subtitle: disabled
              ? `Available in ${trickInfo.min_difficulty} or higher. ${trickInfo.description}`
              : trickInfo.description,
          },
        }
      })
      .sort((a, b) => {
        if (a.props.disabled !== b.props.disabled) {
          return (a.props.disabled ? 1 : 0) - (b.props.disabled ? 1 : 0)
        }

        if (a.props.disabled) {
          const difficultyCompare = getDifficultyOrder(trickByName.value[a.value]?.min_difficulty) - getDifficultyOrder(trickByName.value[b.value]?.min_difficulty)

          if (difficultyCompare !== 0) {
            return difficultyCompare
          }
        }

        return a.title.localeCompare(b.title)
      })
  })

  watch(() => model.value.difficulty, (value, oldValue) => {
    const newDifficultyOrder = getDifficultyOrder(value)
    const oldDifficultyOrder = getDifficultyOrder(oldValue)

    if (newDifficultyOrder >= oldDifficultyOrder) {
      return
    }

    invalidSelectedTricks.value = new Set(model.value.tricks.filter(trick => getDifficultyOrder(trickByName.value[trick]?.min_difficulty) > newDifficultyOrder))
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

  const randomizeDoorsBoolean = computed<boolean>({
    get() {
      return !!model.value.randomizeDoors
    },
    set(value) {
      model.value.randomizeDoors = value ? 1 : 0
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
</style>
