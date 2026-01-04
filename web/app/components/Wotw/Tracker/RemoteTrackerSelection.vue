<template>
  <v-card>
    <v-card-title class="mt-3">Create Web Tracker</v-card-title>
    <v-card-text class="text-left">
      <div class="mb-6">
        <div>
          <rando-settings-checkbox
            v-model="isRemote"
            :disabled="!userStore.isLoggedIn"
            label="For Remote Access"
            description="Create tracker to share with others. Not needed if streaming it yourself."
          />
          <v-tooltip location="bottom" activator="parent" open-delay="300" :disabled="userStore.isLoggedIn">
            <span>Log in to create remote tracker</span>
          </v-tooltip>
        </div>
        <rando-settings-checkbox v-model="showTimer" label="Show Timer" description="Show the run timer."/>
        <rando-settings-checkbox
          v-model="showWillowHearts"
          label="Show Willow Hearts"
          description="Shows the amount of destroyed willow hearts."
        />
        <rando-settings-checkbox
          v-model="hideWillowHeartsUntilFirstHeart"
          :disabled="!showWillowHearts"
          label="Hide counter until first heart is destroyed"
          description="Only shows the amount of willow hearts when at least one heart is destroyed."
        />
      </div>
      <div class="d-flex justify-end">
        <v-btn color="accent" depressed :loading="remoteTrackerUrlCopying" @click="exposeTracker"
        >Create Link
        </v-btn
        >
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
  const userStore = useUserStore()
  const authStore = useAuthStore()
  const electronApi = useElectronApi()
  const router = useRouter()

  const props = defineProps<{
    userIsLoggedIn: boolean
  }>()

  const isRemote = ref(true)
  const showTimer = ref(true)
  const showWillowHearts = ref(true)
  const hideWillowHeartsUntilFirstHeart = ref(true)

  const remoteTrackerUrlCopying = ref(false)
  const emit = defineEmits("created")

  onMounted(() => {
    isRemote.value = props.userIsLoggedIn
  })

  const exposeTracker = (async () => {
    remoteTrackerUrlCopying.value = true

    const args: Record<string, string> = {}

    console.log(authStore.jwt)

    // remote
    if (isRemote.value) {

      const remoteId = undefined
      // TODO expose tracker
      // const remoteId = await electronApi?.localTrackerWebSocket.expose.query({
      //   baseUrl: WS_BASE_URL,
      //   jwt: authStore.jwt!,
      // })

      if (remoteId) {
        args.source = remoteId
      }
    }


    // timer
    if (showTimer.value) {
      args.timer = 'true'
    }

    // willow hearts
    if (showWillowHearts.value) {
      args.hearts = 'true'

      // hide willow hearts until first is destroyed
      if (hideWillowHeartsUntilFirstHeart.value) {
        args.hideHeartsUntilFirst = 'true'
      }
    }

    const targetRoute = router.resolve({
      name: 'tracker',
      query: args,
    })

    // TODO use global baseURL variable
    const url = new URL(targetRoute.href.replace('#/', ''), "https://wotw.orirando.com/api")

    await window.navigator.clipboard.writeText(url.toString())
    remoteTrackerUrlCopying.value = false

    // TODO notification
    // EventBus.$emit('notification', {
    //   message: `Copied to clipboard`,
    //   color: 'success darken-3',
    //   timeout: 1000,
    // })

    emit("created")
  })

</script>

<style lang="scss" scoped>

</style>
