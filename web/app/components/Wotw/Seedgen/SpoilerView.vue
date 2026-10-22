<template>
  <v-sheet class="fill-height d-flex flex-column">
    <v-toolbar color="secondary" density="compact">
      <v-toolbar-title>Spoiler</v-toolbar-title>
      <div class="toolbar-search d-flex align-center justify-center">
        <v-text-field
          ref="searchField"
          v-model="searchQuery"
          prepend-inner-icon="mdi-magnify"
          density="compact"
          hide-details="auto"
          clearable
          @keydown.enter.prevent="$event.shiftKey ? previousMatch() : nextMatch()"
        >
          <template #append-inner>
            <span
              v-if="searchQuery.trim()"
              class="text-caption text-no-wrap"
            >
              {{ highlightCount > 0 ? focusedHighlightIndex + 1 : 0 }}
              / {{ highlightCount }}
            </span>
          </template>
        </v-text-field>
        <div class="d-flex align-center ml-2 ga-2">
          <v-btn
            icon="mdi-chevron-up"
            size="small"
            :disabled="highlightCount === 0"
            @click="previousMatch"
          />

          <v-btn
            icon="mdi-chevron-down"
            size="small"
            :disabled="highlightCount === 0"
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
    <div class="text-content pa-3">
      <component :is="highlightedSpoilerTextVNodes" />
    </div>
  </v-sheet>
</template>

<script lang="ts" setup>
  import type {UserInfo} from "@shared/types/http-api"

  const props = withDefaults(defineProps<{
    spoilerContent: string,
    viewedBy?: UserInfo[] | null,
  }>(), {
    viewedBy: null,
  })

  const emit = defineEmits(["close"])
  const searchField = ref<null | HTMLElement>(null)
  const searchQuery = ref("")
  const focusedHighlightIndex = ref(0)
  const focusedHighlightElement = shallowRef<HTMLElement | null>(null)

  type Token = {
    length: number
    type: "highlight" | "text"
  }

  type Tokens = {
    tokens: Token[]
    highlights: number
  }

  // Tokenize spoiler text into "highlight" and "text" segments
  const tokens = computed<Tokens>(() => {
    const lowercaseSearchQuery = searchQuery.value.toLowerCase()

    const tokens: Token[] = []
    let highlights = 0

    if (!lowercaseSearchQuery) {
      tokens.push({
        length: props.spoilerContent.length,
        type: "text",
      })
    } else {
      let nextTokenIndex = 0
      while (nextTokenIndex < props.spoilerContent.length) {
        const matchStartIndex = props.spoilerContent.toLowerCase().indexOf(lowercaseSearchQuery, nextTokenIndex)
        if (matchStartIndex === -1) {
          tokens.push({
            length: props.spoilerContent.length - nextTokenIndex,
            type: "text",
          })
          break
        }

        const lengthBeforeMatch = matchStartIndex - nextTokenIndex
        if (lengthBeforeMatch > 0) {
          tokens.push({
            length: lengthBeforeMatch,
            type: "text",
          })
        }

        tokens.push({
          length: lowercaseSearchQuery.length,
          type: "highlight",
        })
        highlights++

        nextTokenIndex = matchStartIndex + lowercaseSearchQuery.length
      }
    }

    return {
      tokens,
      highlights,
    }
  })

  const highlightCount = computed(() => {
    return tokens.value.highlights
  })

  watch([highlightCount, focusedHighlightIndex], () => {
    focusedHighlightIndex.value = Math.min(focusedHighlightIndex.value, Math.max(0, highlightCount.value - 1))
  })

  // Render tokens as VNodes
  function highlightedSpoilerTextVNodes() {
    const vNodes: (VNode | string)[] = []

    let textIndex = 0
    let highlightIndex = 0
    for (const token of tokens.value.tokens) {
      switch (token.type) {
        case "highlight":
          const isFocusedHighlight = highlightIndex === focusedHighlightIndex.value
          vNodes.push(
            h(
              "mark",
              {
                "data-token-index": textIndex,
                "class": [
                  "search-match",
                  {"search-match--active": isFocusedHighlight},
                ],
                ref: (el) => {
                  if (isFocusedHighlight) {
                    focusedHighlightElement.value = el as HTMLElement
                    triggerRef(focusedHighlightElement)
                  }
                },
              },
              props.spoilerContent.substring(textIndex, textIndex + token.length)
            ),
          )
          highlightIndex++
          break
        case "text":
          vNodes.push(props.spoilerContent.substring(textIndex, textIndex + token.length))
          break
      }

      textIndex += token.length
    }

    return h("div", [vNodes])
  }

  async function goToMatch(index: number) {
    if (highlightCount.value === 0) {
      return
    }
    focusedHighlightIndex.value = index % highlightCount.value
  }

  watch(focusedHighlightElement, () => {
    focusedHighlightElement.value?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    })
  })

  function nextMatch() {
    goToMatch(focusedHighlightIndex.value + 1)
  }

  function previousMatch() {
    goToMatch(focusedHighlightIndex.value - 1)
  }

  function handleKeydown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") {
      event.preventDefault()
      searchField.value?.focus()
    }
  }

  onMounted(() => {
    window.addEventListener("keydown", handleKeydown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener("keydown", handleKeydown)
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
    color: black;
    border-radius: 2px;
    padding: 0 2px;
    margin: 0 -2px;
  }

  .text-content :deep(.search-match--active) {
    background-color: rgb(var(--v-theme-primary-darken-2));
    outline: 3px solid rgb(var(--v-theme-primary-darken-1));
    outline-offset: 1px;
  }
</style>
