<template>
  <v-app>
    <v-main class="content">
      <v-container class="fill-height flex-column align-center justify-center">
        <img alt="" src="@shared/images/ori_shy.png">
        <h1 class="mb-4">Something went oribly wrong.</h1>

        <div
          v-if="error.statusCode !== 404"
          class="mb-3">Press
          <v-kbd>Ctrl</v-kbd>
          +
          <v-kbd>R</v-kbd>
          to reload or
        </div>
        <v-btn
          :to="homeRoute"
          prepend-icon="mdi-home"
          color="accent"
          variant="flat"
          class="mb-5"
        >
          Go home
        </v-btn>
        <v-expand-transition>
          <div v-if="showError" class="error-container">
            <v-code class="error-code">{{ error.stack }}
              <v-spacer/>
              <v-btn class="mt-3 mb-1" @click="copyToClipboard">Copy to clipboard</v-btn>
            </v-code>
          </div>
          <v-btn v-else variant="text" @click="showError = true">Show error</v-btn>
        </v-expand-transition>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
  import type {NuxtError} from "#app"

  const props = defineProps<{
    error: NuxtError
  }>()

  console.error("Error from the error page:", props.error)

  const showError = ref(false)

  const homeRoute = computed(() => useIsElectron()
    ? {
      name: "electron",
    }
    : {
      name: "index",
    },
  )

  const copyToClipboard = (() => {
    if (props.error.stack) {
      navigator.clipboard.writeText(props.error.stack)
    }
  })

</script>

<style lang="scss" scoped>
  .error-container {
    max-width: 100%;

    .error-code {
      display: block;
      white-space: pre;
      overflow: auto;
    }
  }
</style>
