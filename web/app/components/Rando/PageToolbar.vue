<template>
  <div class="page-toolbar d-flex align-center my-4">
    <v-scale-transition group tag="div" class="d-flex toolbar-gap align-center">
      <!-- TODO stats -->
      <!-- TODO mygames -->
      <!-- TODO archipelago -->
      <!-- TODO Map -->

      <!--   MAIN BUTTONS  -->
      <v-btn key="home" exact :to="`${isElectron ? `/electron` : `/`}`" size="x-large" variant="text">
        <v-icon>mdi-home-outline</v-icon>
      </v-btn>
      <v-btn key="seedgen" size="x-large" variant="text" to="/seedgen">
        <v-icon :start="!mdAndDown">mdi-dice-multiple</v-icon>
        <span v-if="!mdAndDown">Seed Generator</span>
      </v-btn>
      <v-btn key="league" size="x-large" variant="text" to="/league/seasons">
        <v-badge
          color="deep-purple"
          :model-value="leagueHelper.pendingGamesCount.value > 0"
          :content="leagueHelper.pendingGamesCount.value"
          :offset-x="-10"
          :offset-y="-5"
        >
          <v-icon :start="!mdAndDown">mdi-trophy</v-icon>
          <span v-if="!mdAndDown">League</span>
        </v-badge>
      </v-btn>
      <div key="my-games" class="position-relative">
        <v-btn
          v-if="userStore.isLoggedIn"
          exact
          size="x-large"
          variant="text"
          @click="toggleMultiversesMenu"
        >
          <v-icon :start="!mdAndDown">mdi-gamepad-variant-outline</v-icon>
          <span v-if="!mdAndDown">My Games</span>
          <v-menu v-model="multiversesMenuOpen" target="parent" stick-to-target>
            <v-list>
              <v-list-item
                v-for="item in multiverses"
                :key="item.id"
                :to="{ name: 'game-multiverseId', params: { multiverseId: item.id } }"
                class="py-3 flex-column"
              >
                <div class="multiverse-id-container d-flex ga-3">
                  <div>
                    <span class="hashtag">#</span><span class="multiverse-id">{{ item.id }}</span>
                  </div>
                  <div class="d-flex flex-wrap-reverse">
                    <rando-discord-avatar
                      v-for="member in item.members"
                      :key="member.id"
                      :user="member"
                      :size="24"
                      class="inset-avatar"
                    />
                  </div>
                </div>
                <div class="opacity-70 line-height-1 pt-1">
                  {{ useTimeAgo(item.createdAt) }}
                </div>
              </v-list-item>
              <v-list-item key="more" :to="{ name: 'my-games' }" :active="false">
                <v-icon start>mdi-arrow-down</v-icon>
                Older Games...
              </v-list-item>
            </v-list>
          </v-menu>
        </v-btn>
        <div class="position-absolute button-progress-bar">
          <v-progress-linear v-if="loadingMultiverses" indeterminate height="2" class="position-absolute" />
        </div>
      </div>
      <v-btn v-if="isElectron" key="settings" size="x-large" variant="text" to="/electron/settings">
        <v-icon :start="!mdAndDown">mdi-cog-outline</v-icon>
        <span v-if="!mdAndDown">Settings</span>
      </v-btn>
      <v-btn v-if="randoIpcIsConnected" key="stats" size="x-large" variant="text" @click="statsDialog.open = true">
        <v-icon :start="!mdAndDown">mdi-chart-timeline</v-icon>
        <span v-if="!mdAndDown">Stats</span>
      </v-btn>
      <!--  MENU  -->
      <div v-if="isElectron" key="electron-menu">
        <v-menu offset-y>
          <template #activator="{ props }">
            <v-btn variant="text" icon v-bind="props">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list>
            <!-- TODO disable when tracker already running -->
            <v-list-item size="x-large" variant="text" @click="openLocalTrackerWindow">
              <v-icon start>mdi-radar</v-icon>
              Tracker
            </v-list-item>
            <!-- TODO disable when tracker already running -->
            <v-list-item
              size="x-large"
              variant="text"
              @click="showRemoteTrackerDialog = true"
            >
              <v-icon start>mdi-leak</v-icon>
              Create Web Tracker
            </v-list-item>
            <v-list-item size="x-large" variant="text" @click="openToolsWindow">
              <v-icon start>mdi-tools</v-icon>
              Tools
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-scale-transition>
    <v-spacer />
    <rando-throttled-spinner no-margin>
      <template v-if="userStore.user !== undefined" #content>
        <div class="d-flex align-center">
          <template v-if="userStore.isLoggedIn">
            <!-- TODO no greeting on mobile -->
            <div v-if="!smAndDown" class="mr-4 user-info">
              <div class="text-no-wrap">{{ randomGreeting }}</div>
            </div>
            <v-menu offset-y left nudge-bottom="6">
              <template #activator="{ props }">
                <v-btn x-large class="ma-0 mr-1" icon v-bind="props">
                  <rando-discord-avatar v-if="userStore.user" :user="userStore.user" :size="48" />
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="editedNickname = ''; showEditNicknameDialog = true">
                  <v-icon start>mdi-account-edit-outline</v-icon>
                  Change Nickname
                </v-list-item>
                <!-- TODO Dev Tools
                <v-list-item v-if="userStore.isDeveloper" @click="toggleDevtools">
                  <v-icon start>mdi-code-braces</v-icon>
                  {{ devtoolsEnabled ? 'Disable' : 'Enable' }} Server Devtools
                </v-list-item>
                -->
                <v-list-item @click="logout">
                  <v-icon start>mdi-logout-variant</v-icon>
                  Log out
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
          <template v-else>
            <v-btn size="x-large" variant="text" @click="login">
              <v-icon start>mdi-login-variant</v-icon>
              Log in
            </v-btn>
          </template>
        </div>
      </template>
    </rando-throttled-spinner>
  </div>

  <v-dialog v-model="showEditNicknameDialog" :persistent="RenameRequestInProgress" max-width="500">
    <v-card>
      <v-card-title>Change Nickname</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="editedNickname"
          autofocus
          label="Nickname"
          counter="32"
          @keydown.enter="saveNickname"
        />

        <div class="d-flex">
          <v-spacer />
          <v-btn
            class="mr-1"
            variant="text"
            :disabled="RenameRequestInProgress"
            @click="showEditNicknameDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            variant="flat"
            color="accent"
            :disabled="!nicknameIsValid"
            :loading="RenameRequestInProgress"
            @click="saveNickname"
          >
            Save
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
  <v-dialog v-model="showRemoteTrackerDialog" max-width="500px">
    <wotw-tracker-remote-tracker-selection
      :user-is-logged-in="userStore.isLoggedIn"
      @created="showRemoteTrackerDialog = false"
    />
  </v-dialog>
</template>

<script lang="ts" setup>
  import {useDisplay} from "vuetify"
  import type {MultiverseMetadataInfo} from "@shared/types/http-api"
  import {useTimeAgo} from "@vueuse/core"

  const isElectron = useIsElectron()
  const electronApi = isElectron ? useElectronApi() : null
  const authStore = useAuthStore()
  const route = useRoute()
  const {axios, catchAxiosErrors} = useAxios()
  const userStore = useUserStore()
  const leagueHelper = useLeagueHelper()
  const {smAndDown, mdAndDown} = useDisplay()
  const editedNickname = ref("")
  const showEditNicknameDialog = ref(false)
  const RenameRequestInProgress = ref(false)
  const showRemoteTrackerDialog = ref(false)
  const multiverses = ref<MultiverseMetadataInfo[] | null>(null)
  const loadingMultiverses = ref(false)
  const multiversesMenuOpen = ref(false)
  const {isConnected: randoIpcIsConnected} = useRandoIpc()
  const statsDialog = useStatsDialogStore()

  const randomGreetingTemplate = computed(() => {
    const templates = [
      "Hi, #!",
      "Hello, #!",
      "Hey, #!",
      "Hiya, #!",
      "Yo, #!",
      "Ahoy, #!",
      "Howdy, #!",
      "oriHi, #!",
      "Hello there, #!",
      "Hola, #!",
      "#, wassup?",
    ]
    return templates[Math.floor(Math.random() * templates.length)]!
  })
  const nicknameIsValid = computed(() => {
    const trimmedNickname = editedNickname.value.trim()
    return trimmedNickname.length > 0 && trimmedNickname.length <= 32
  })

  onMounted(async () => {
    await leagueHelper.updatePendingGames()
  })

  const randomGreeting = computed(() => {
    return randomGreetingTemplate.value.replace("#", userStore.user?.name ?? "")
  })

  async function login() {
    const {apiBaseUrl} = await useBaseUrls()

    if (!electronApi) {
      authStore.redirectPath = route.fullPath

      const url = new URL(apiBaseUrl)
      url.pathname += "/login"
      url.searchParams.set("redirect", `${window.location.origin}/auth/callback`)
      window.location.href = url.href
      return
    }

    const shortLivedJwt = await electronApi.auth.startOAuthFlow.query({
      apiBaseUrl,
    })

    axios.defaults.headers.common["Authorization"] = `Bearer ${shortLivedJwt}`

    const longLivedJwt = (await axios.post("/tokens/", {
      scopes: ["*"],
    })).data as string

    if (longLivedJwt) {
      await authStore.setJwt(longLivedJwt)
    }
  }

  async function logout() {
    await authStore.setJwt(null)
  }

  async function saveNickname() {
    if (!nicknameIsValid.value) {
      return
    }

    RenameRequestInProgress.value = true
    await axios.put("/users/me/nickname", editedNickname.value, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    })
    await userStore.updateUser()
    RenameRequestInProgress.value = false
    showEditNicknameDialog.value = false
  }

  async function openLocalTrackerWindow() {
    await electronApi?.localTracker.openWindow.query()
  }

  async function openToolsWindow() {
    await electronApi?.toolsWindow.openWindow.query()
  }

  async function fetchMultiverses() {
    loadingMultiverses.value = true
    await catchAxiosErrors(
      async () => {
        multiverses.value = (await axios.get("/multiverses/own", {params: {limit: 6}})).data
      },
      async (e) => {
        multiverses.value = null
        console.error(e)
      },
    )
    loadingMultiverses.value = false
  }

  async function toggleMultiversesMenu() {
    if (loadingMultiverses.value) {
      return
    }

    if (multiversesMenuOpen.value) {
      multiversesMenuOpen.value = false
      return
    }

    if (multiverses.value !== null) {
      multiversesMenuOpen.value = true
      await fetchMultiverses()
    } else {
      await fetchMultiverses()
      multiversesMenuOpen.value = true
    }
  }
</script>

<style lang="scss" scoped>
  .page-toolbar {
    gap: 0.2em;
  }

  .toolbar-gap {
    gap: 0.2em;
  }

  .toolbar-button-text {
    font-size: 1.0rem;
  }

  .multiverse-id-container {
    display: flex;
    line-height: 1;

    .hashtag {
      font-size: 1em;
    }

    .multiverse-id {
      font-size: 1.5em;
      font-weight: 900;
    }
  }

  .inset-avatar:not(:first-of-type) {
    margin-left: -10px;
  }

  .button-progress-bar {
    bottom: 0;
    left: 0;
    right: 0;
  }

  .line-height-1 {
    line-height: 1;
  }
</style>
