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
      <!-- TODO pending league games -->
      <v-btn key="league" size="x-large" variant="text" to="/league/seasons">
        <v-icon start>mdi-trophy</v-icon>
        <span class="toolbar-button-text">League</span>
        <v-icon :start="!mdAndDown">mdi-trophy</v-icon>
        <span v-if="!mdAndDown">League</span>
      </v-btn>
      </v-btn>
      <v-btn v-if="isElectron" key="settings" size="x-large" variant="text" to="/electron/settings">
        <v-icon :start="!mdAndDown">mdi-cog-outline</v-icon>
        <span v-if="!mdAndDown">Settings</span>
      </v-btn>

      <!--  MENU  -->
      <div key="electron-menu">
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
          </v-list>
        </v-menu>
      </div>
    </v-scale-transition>
    <v-spacer/>
    <rando-throttled-spinner no-margin>
      <div class="d-flex align-center">
        <template v-if="userStore.isLoggedIn">
          <!-- TODO no greeting on mobile -->
          <div v-if="!smAndDown" class="mr-4 user-info">
            <div class="text-no-wrap">{{ randomGreeting(userStore.user?.name ?? '') }}</div>
          </div>
          <v-menu offset-y left nudge-bottom="6">
            <template #activator="{ props }">
              <v-btn x-large class="ma-0 mr-1" icon v-bind="props">
                <rando-discord-avatar v-if="userStore.user" :user="userStore.user" size="48"/>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="editedNickname = ''; showEditNicknameDialog = true">
                <v-icon left>mdi-account-edit-outline</v-icon>
                Change Nickname
              </v-list-item>
              <!-- TODO Dev Tools
              <v-list-item v-if="userStore.isDeveloper" @click="toggleDevtools">
                <v-icon left>mdi-code-braces</v-icon>
                {{ devtoolsEnabled ? 'Disable' : 'Enable' }} Server Devtools
              </v-list-item>
              -->
              <v-list-item @click="logout">
                <v-icon left>mdi-logout-variant</v-icon>
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
          <v-spacer/>
          <v-btn class="mr-1" text :disabled="RenameRequestInProgress" @click="showEditNicknameDialog = false">
            Cancel
          </v-btn>
          <v-btn
            depressed
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
</template>

<script lang="ts" setup>
  import {useDisplay} from "vuetify"

  const isElectron = useIsElectron()
  const electronApi = isElectron ? useElectronApi() : null
  const authStore = useAuthStore()
  const route = useRoute()
  const {axios} = useAxios()
  const userStore = useUserStore()
  const {smAndDown, mdAndDown} = useDisplay()
  const editedNickname = ref('')
  const showEditNicknameDialog = ref(false)
  const RenameRequestInProgress = ref(false)
  const randomGreetingTemplate = computed(() => {
    const templates = [
      'Hi, #!',
      'Hello, #!',
      'Hey, #!',
      'Hiya, #!',
      'Yo, #!',
      'Ahoy, #!',
      'Howdy, #!',
      'oriHi, #!',
      'Hello there, #!',
      'Hola, #!',
      '#, wassup?',
    ]
    return templates[Math.floor(Math.random() * templates.length)]
  })
  const nicknameIsValid = computed(() => {
    const trimmedNickname = editedNickname.value.trim()
    return trimmedNickname.length > 0 && trimmedNickname.length <= 32
  })


  const randomGreeting = ((username: string) => {
    return randomGreetingTemplate.value.replace('#', username)
  })

  const login = (async () => {
    if (!electronApi) {
      authStore.redirectPath = route.fullPath

      const url = new URL(axios.defaults.baseURL ?? "")
      url.pathname += "/login"
      url.searchParams.set("redirect", `${window.location.origin}/auth/callback`)
      window.location.href = url.href
      return
    }

    const shortLivedJwt = await electronApi.auth.startOAuthFlow.query({
      apiBaseUrl: "https://wotw.orirando.com/api",
    })

    axios.defaults.headers.common['Authorization'] = `Bearer ${shortLivedJwt}`

    const longLivedJwt = (await axios.post('/tokens/', {
      scopes: ['*'],
    })).data as string

    if (longLivedJwt) {
      await authStore.setJwt(longLivedJwt)
    }
  })

  const logout = (async () => {
    await authStore.setJwt(null)
  })
  const saveNickname = (async () => {
    if (!nicknameIsValid.value) {
      return
    }

    RenameRequestInProgress.value = true
    await axios.put('/users/me/nickname', editedNickname.value, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
    await userStore.updateUser()
    RenameRequestInProgress.value = false
    showEditNicknameDialog.value = false
  })

  const openLocalTrackerWindow = (async () => {
    await electronApi?.localTracker.openWindow.query()
  })

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
</style>
