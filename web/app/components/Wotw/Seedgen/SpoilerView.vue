<template>
  <v-sheet class="fill-height d-flex flex-column">
    <v-toolbar color="secondary" density="compact">
      <v-toolbar-title>Spoiler</v-toolbar-title>
      <div class="toolbar-search d-flex align-center justify-center">
        <v-text-field
          ref="searchField"
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          density="compact"
          hide-details="auto"
          clearable
          @keydown.enter.prevent="$event.shiftKey ? previousMatch() : nextMatch()"
        >
          <template #append-inner>
            <span
              v-if="search.trim()"
              class="text-caption text-no-wrap"
            >
              {{ matchCount > 0 ? currentMatch + 1 : 0 }}
              / {{ matchCount }}
            </span>
          </template>
        </v-text-field>
        <div class="d-flex align-center ml-2 ga-2">
          <v-btn
            icon="mdi-chevron-up"
            size="small"
            :disabled="matchCount === 0"
            @click="previousMatch"
          />

          <v-btn
            icon="mdi-chevron-down"
            size="small"
            :disabled="matchCount === 0"
            @click="nextMatch"
          />
        </div>
      </div>
      <div class="ml-3">
        <rando-discord-avatar
          v-for="user in viewedBy"
          :key="user.id"
          v-tooltip="user.name"
          :user="user"
        />
      </div>
      <v-btn icon @click="emit('close')">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>

    <div class="text-content pa-3" v-html="highlightedText"/>
  </v-sheet>
</template>

<script lang="ts" setup>
  import type {UserInfo} from "@shared/types/http-api";

  const props = withDefaults(defineProps<{
    spoilerContent: string,
    viewedBy?: UserInfo[] | null,
  }>(), {
    viewedBy: null,
  })

  const emit = defineEmits(["close"])

  const searchField = ref<null | HTMLElement>(null)
  const search = ref('')
  const currentMatch = ref(0)

  watch(search, async () => {
    currentMatch.value = 0

    await nextTick()

    if (matchCount.value > 0) {
      await goToMatch(0)
    }
  })

  const matchCount = computed(() => {
    const term = search.value.trim()

    if (!term) return 0

    const regex = new RegExp(
      escapeRegExp(escapeHtml(term)),
      'gi'
    )

    return escapeHtml(props.spoilerContent).match(regex)?.length ?? 0
  })

  const highlightedText = computed(() => {
    const escapedText = escapeHtml(props.spoilerContent)
    const term = search.value.trim()

    if (!term) return escapedText

    const regex = new RegExp(
      `(${escapeRegExp(escapeHtml(term))})`,
      'gi'
    )

    let index = 0

    return escapedText.replace(regex, (match) => {
      const isActive = index === currentMatch.value
      const matchIndex = index++

      return `<mark
      class="search-match${isActive ? ' search-match--active' : ''}"
      data-match-index="${matchIndex}"
      tabindex="-1"
    >${match}</mark>`
    })
  })

  function escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  async function goToMatch(index: number) {
    if (matchCount.value === 0) return

    currentMatch.value =
      (index + matchCount.value) % matchCount.value

    await nextTick()

    const element = document.querySelector<HTMLElement>(
      `.search-match[data-match-index="${currentMatch.value}"]`
    )

    element?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })

  }

  function nextMatch() {
    goToMatch(currentMatch.value + 1)
  }

  function previousMatch() {
    goToMatch(currentMatch.value - 1)
  }

  function handleKeydown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
      event.preventDefault()
      searchField.value?.focus()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
  })

</script>

<style lang="scss" scoped>

  .toolbar-search {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: min(550px, 50%);
  }

  .text-content {
    font-family: Consolas, 'Fira Code', monospace;
    min-height: 0;
    flex-grow: 1;
    overflow-y: scroll;
    white-space: pre-wrap;
  }

  .text-content :deep(.search-match) {
    background-color: rgb(var(--v-theme-primary-darken-2));
    color: #000;
    border-radius: 2px;
    padding: 0 2px;
  }

  .text-content :deep(.search-match--active) {
    background-color: rgb(var(--v-theme-primary-darken-2));
    outline: 3px solid rgb(var(--v-theme-primary-darken-1));
    outline-offset: 1px;
  }

</style>
