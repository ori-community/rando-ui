<template>
  <div>
    <h2 class="mb-2">Choose how to launch the game:</h2>

    <v-item-group v-model="gameLaunchMethod" mandatory selected-class="bg-accent">
      <v-row dense>
        <v-col v-for="(metadata, id) in gameLaunchMethodsMetadata" :key="id" cols="12" md="4">
          <v-item v-slot="{ selectedClass, toggle }" :value="id">
            <v-card
              :class="[selectedClass]"
              class="fill-height"
              :variant="availableGameLaunchMethods.includes(id) ? 'tonal' : 'plain'"
              :disabled="!availableGameLaunchMethods.includes(id)"
              @click="toggle"
            >
              <v-card-title>
                {{ metadata.name }}
                <template v-if="!availableGameLaunchMethods.includes(id)">(unavailable)</template>
              </v-card-title>
              <v-card-text>
                <component :is="metadata.descriptionComponent(platform)" />
              </v-card-text>
            </v-card>
          </v-item>
        </v-col>
      </v-row>
    </v-item-group>

    <v-expand-transition>
      <div v-if="gameLaunchMethod !== null && !!gameLaunchMethodsMetadata[gameLaunchMethod]?.alerts?.[platform]">
        <v-alert color="warning" class="mt-3">
          <component :is="gameLaunchMethodsMetadata[gameLaunchMethod]?.alerts?.[platform]" />
        </v-alert>
      </div>
    </v-expand-transition>
  </div>
  <v-expand-transition>
    <div v-if="gameLaunchMethod !== null">
      <h2 class="mb-2 pt-4">Choose how to load the randomizer mod:</h2>

      <v-item-group v-model="modloaderMethod" mandatory selected-class="bg-accent">
        <v-row dense>
          <v-col v-for="(metadata, id) in modloaderMethodsMetadata" :key="id" cols="12" md="4">
            <v-item v-slot="{ selectedClass, toggle }" :value="id">
              <v-card
                :class="[selectedClass]"
                class="fill-height"
                :variant="availableModloaderMethods.includes(id) ? 'tonal' : 'plain'"
                :disabled="!availableModloaderMethods.includes(id)"
                @click="toggle"
              >
                <v-card-title>
                  {{ metadata.name }}
                  <template v-if="!availableModloaderMethods.includes(id)">(unavailable)</template>
                </v-card-title>
                <v-card-text>
                  <component :is="metadata.descriptionComponent" />
                </v-card-text>
              </v-card>
            </v-item>
          </v-col>
        </v-row>
      </v-item-group>
    </div>
  </v-expand-transition>
  <v-expand-transition>
    <div v-if="gameLaunchMethod !== null && modloaderMethod !== null">
      <div class="pt-6" />

      <v-expand-transition>
        <div v-if="gameLaunchMethod === 'steam'">
          <v-text-field
            v-model="steamBinaryPath"
            readonly
            class="mt-5"
            :label="`Click to select the path to Steam (${steamBinaryName})`"
            append-icon="mdi-folder-search-outline"
            hide-details
            @click.stop="selectSteamPath"
            @click:append.stop="selectSteamPath"
          />
        </div>
      </v-expand-transition>

      <v-expand-transition>
        <div v-if="gameLaunchMethod === 'standalone' || modloaderMethod === 'proxy'">
          <v-text-field
            v-model="gameBinaryPath"
            readonly
            class="mt-5"
            label="Click to select the path to the game binary (oriwotw.exe)"
            append-icon="mdi-folder-search-outline"
            hide-details
            @click.stop="selectGameBinaryPath"
            @click:append.stop="selectGameBinaryPath"
          />
        </div>
      </v-expand-transition>

      <v-alert v-for="(message, index) in setupErrorMessages" :key="index" color="error" class="mt-3">
        {{ message }}
      </v-alert>

      <div class="d-flex justify-end">
        <v-btn class="mt-6" color="accent" :loading="setupLoading" flat @click="installAndValidate">
          <v-icon start>mdi-check</v-icon>
          Complete setup
        </v-btn>
      </div>
    </div>
  </v-expand-transition>
</template>

<script lang="tsx" setup>
  import type {Settings} from '@shared/types/settings'
  import {
    gameLaunchMethodsMetadata,
    launchSetupValidationErrorMessages,
    modloaderMethodsMetadata,
  } from '~/assets/uiMetadata'

  const emits = defineEmits<{
    setupFinished: [],
  }>()

  const props = withDefaults(
    defineProps<{
      loadDefaultsFromSettings?: boolean,
    }>(), {
      loadDefaultsFromSettings: true,
    }
  )

  const platform = await usePlatform()
  const settingsStore = useSettingsStore()
  const settings = storeToRefs(settingsStore)
  const electronApi = useElectronApi()
  const availableGameLaunchMethods = ref<Settings['GameLaunchMethod'][]>([])
  const availableModloaderMethods = ref<Settings['ModloaderMethod'][]>([])
  const gameLaunchMethod = ref<Settings['GameLaunchMethod'] | null>(props.loadDefaultsFromSettings ? settings.GameLaunchMethod.value : null)
  const modloaderMethod = ref<Settings['ModloaderMethod'] | null>(props.loadDefaultsFromSettings ? settings.ModloaderMethod.value : null)
  const steamBinaryPath = ref("")
  const gameBinaryPath = ref("")
  const setupLoading = ref(false)
  const setupErrorMessages = ref<string[]>([])

  const steamBinaryName = computed(() => {
    switch (platform) {
      case "windows":
        return "steam.exe"
      case "linux":
      case "other":
      default:
        return "usually /usr/bin/steam"
    }
  })

  watch(gameLaunchMethod, async () => {
    if (!electronApi || gameLaunchMethod.value === null) {
      availableModloaderMethods.value = []
      return
    }

    const availableOnPlatform = new Set(await electronApi.launcher.getModloaderMethodsAvailableOnPlatform.query())
    const availableForGameLaunchMethod = new Set(await electronApi.launcher.getModloaderMethodsAvailableOnForGameLaunchMethod.query(gameLaunchMethod.value))
    const availableModloaderMethodsSet = availableOnPlatform.intersection(availableForGameLaunchMethod)
    availableModloaderMethods.value = Array.from(availableModloaderMethodsSet)

    if (modloaderMethod.value !== null && !availableModloaderMethodsSet.has(modloaderMethod.value)) {
      modloaderMethod.value = null
    }
  }, {immediate: true})

  watch(settings.isInitialized, (value) => {
    if (!value) {
      return
    }

    gameBinaryPath.value = settings.GameBinaryPath.value
    steamBinaryPath.value = settings.SteamBinaryPath.value
  }, {immediate: true})

  onMounted(async () => {
    if (!electronApi) {
      return
    }

    availableGameLaunchMethods.value = await electronApi.launcher.getGameLaunchMethodsAvailableOnPlatform.query()
  })

  async function selectSteamPath() {
    const newPath = await electronApi?.systemDialogs.pickFile.query({
      defaultPath: steamBinaryPath.value,
      filters: [{name: 'Executables', extensions: platform === "windows" ? ['exe'] : []}],
    })

    if (newPath) {
      steamBinaryPath.value = newPath
    }
  }

  async function selectGameBinaryPath() {
    const newPath = await electronApi?.systemDialogs.pickFile.query({
      defaultPath: gameBinaryPath.value,
      filters: [{name: 'Executables', extensions: ['exe']}],
    })

    if (newPath) {
      gameBinaryPath.value = newPath
    }
  }

  async function installAndValidate() {
    if (gameLaunchMethod.value === null || modloaderMethod.value === null || electronApi === null) {
      return
    }

    setupLoading.value = true

    try {
      settings.GameLaunchMethod.value = gameLaunchMethod.value
      settings.ModloaderMethod.value = modloaderMethod.value
      settings.GameBinaryPath.value = gameBinaryPath.value
      settings.SteamBinaryPath.value = steamBinaryPath.value

      if (modloaderMethod.value === "proxy") {
        await electronApi.launcher.installOrUpdateProxyModloader.query()
      }

      setupErrorMessages.value = (await electronApi.launcher.validateSetup.query()).map(e => launchSetupValidationErrorMessages[e])

      if (setupErrorMessages.value.length === 0) {
        emits("setupFinished")
      }
    } catch (e) {
      setupErrorMessages.value = [String(e)]
    }

    setupLoading.value = false
  }
</script>

<style lang="scss" scoped>

</style>
