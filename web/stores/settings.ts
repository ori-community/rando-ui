import {defineStore} from "pinia"
import type {Settings, SettingKey} from "@shared/types/settings"


export const useSettingsStore = defineStore("settings", () => {
  type SettingsRefs = {
    [key in SettingKey]: globalThis.Ref<Settings[key]>
  }

  const electronApi = useElectronApi()

  const isInitialized = ref(false)

  const settingsRefs: SettingsRefs = {
    ServerHost: ref<string>(""),
    ServerTLS: ref<boolean>(false),
    UseMicrosoftStore: ref<boolean>(false),
    DeveloperMode: ref<boolean>(false),
    DebugControls: ref<boolean>(false),
    HideQuestFilter: ref<boolean>(false),
    HideWarpFilter: ref<boolean>(false),
    HideCollectableFilter: ref<boolean>(false),
    AlwaysShowWarps: ref<boolean>(false),
    AlwaysShowKeystones: ref<boolean>(false),
    AlwaysShowKeystoneDoors: ref<boolean>(false),
    EnableWorldMap: ref<boolean>(false),
    GrappleMouseControl: ref<boolean>(false),
    BurrowMouseControl: ref<boolean>(false),
    WaterDashMouseControl: ref<boolean>(false),
    HybridMouseControl: ref<boolean>(false),
    LaunchWithTracker: ref<boolean>(false),
    FunnyMoney: ref<boolean>(false),
    InvertFastSwim: ref<boolean>(false),
    LockCursor: ref<boolean>(false),
    UpdateToPrereleaseVersions: ref<boolean>(false),
    ShowStatsAfterFinish: ref<boolean>(false),
    ShowAllSecrets: ref<boolean>(false),
    DisableAutoAim: ref<boolean>(false),
    SelectInLogicFilterByDefault: ref<boolean>(false),
    EnableMinimap: ref<boolean>(false),
    EnableNativeControllerSupport: ref<boolean>(false),
    MapIconTransparency: ref<number>(0),
    MapPanSpeed: ref<number>(0),
    CameraShakeIntensity: ref<number>(0),
    LocalTrackerWindowPositionX: ref<number>(0),
    LocalTrackerWindowPositionY: ref<number>(0),
    LocalTrackerWindowPositionWidth: ref<number>(0),
    LocalTrackerWindowPositionHeight: ref<number>(0),
    LocalTrackerShowTimer: ref<boolean>(false),
    LocalTrackerTransparent: ref<boolean>(false),
    LocalTrackerAlwaysOnTop: ref<boolean>(false),
    LocalTrackerIgnoreMouse: ref<boolean>(false),
    LocalTrackerShowWillowHearts: ref<boolean>(false),
    LocalTrackerHideHeartsUntilFirstHeart: ref<boolean>(false),
    GameOrSteamBinaryPath: ref<string>(""),
  }

  if (electronApi !== null) {
    (async () => {
      const currentSettings = await electronApi.settings.getSettings.query()

      for (const key in settingsRefs) {
        settingsRefs[key as SettingKey].value = currentSettings[key as SettingKey]

        watch(() => settingsRefs[key as SettingKey].value, async (newValue) => {
          await electronApi.settings.setSetting.query({key, value: newValue})
        })
      }

      electronApi.settings.onSettingChanged.subscribe(undefined, {
        onData({key, value}) {
          if (settingsRefs[key as SettingKey].value !== value) {
            settingsRefs[key as SettingKey].value = value
          }
        },
      })

      isInitialized.value = true
    })()
  } else {
    console.error("Failed to initialize Settings store. Electron API was not available. Do not use the Settings store in non-launcher environments")
  }

  return {
    isInitialized,
    ...settingsRefs,
  }
})
