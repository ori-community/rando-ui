import {defineStore} from "pinia"
import type {Settings, SettingKey} from "@shared/types/settings"


export const useSettingsStore = defineStore("settings", () => {
  type SettingsRefs = {
    [key in SettingKey]: globalThis.Ref<Settings[key]>
  }

  const electronApi = useElectronApi()

  const isInitialized = ref(false)
  let pendingSettingsSubmissions = 0
  let waitForSettingsFlushedResolveFns: (() => void)[] = []

  const settingsRefs: SettingsRefs = {
    ServerHost: ref<string>(""),
    ServerTLS: ref<boolean>(false),
    DeveloperMode: ref<boolean>(false),
    DebugControls: ref<boolean>(false),
    LogDebugMessagesToFile: ref<boolean>(false),
    AlwaysShowKeystones: ref<boolean>(false),
    EnableWorldMap: ref<boolean>(false),
    GrappleMouseControl: ref<boolean>(false),
    BurrowMouseControl: ref<boolean>(false),
    WaterDashMouseControl: ref<boolean>(false),
    HybridMouseControl: ref<boolean>(false),
    LaunchWithTracker: ref<boolean>(false),
    FunnyMoney: ref<boolean>(false),
    InvertFastSwim: ref<boolean>(false),
    LockCursor: ref<boolean>(false),
    ShowStatsAfterFinish: ref<boolean>(false),
    ShowAllSecrets: ref<boolean>(false),
    DisableAutoAim: ref<boolean>(false),
    EnableAutomaticCutsceneSkipping: ref<boolean>(false),
    EnableMinimap: ref<boolean>(false),
    EnableNativeControllerSupport: ref<boolean>(false),
    ShowTransparentOutOfLogicIcons: ref<boolean>(false),
    MapPanSpeed: ref<number>(0),
    ControllerTriggerThreshold: ref<number>(0),
    CameraShakeIntensity: ref<number>(0),
    DisableHealthAndEnergyBarAnimations: ref<boolean>(false),
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
    InitialSetupCompleted: ref<boolean>(false),
    GameLaunchMethod: ref<"steam" | "microsoft-store" | "standalone">("steam"),
    ModloaderMethod: ref<"proxy" | "inject">("proxy"),
    ValidateProxyModloader: ref<boolean>(false),
    GameBinaryPath: ref<string>(""),
    SteamBinaryPath: ref<string>(""),
    LastInstalledProxyHash: ref<string | null>(null),
    LastUsedVersion: ref<string>(""),
  }

  if (electronApi !== null) {
    (async () => {
      const currentSettings = await electronApi.settings.getSettings.query()
      const submittingSettingsKeys = new Set<SettingKey>()

      for (const key in settingsRefs) {
        const settingKey = key as SettingKey
        settingsRefs[settingKey].value = currentSettings[settingKey]
        let pendingValue: undefined | Settings[SettingKey] = undefined

        async function submitSetting(value: Settings[SettingKey], isDebouncedSubmission = false) {
          if (!electronApi) {
            return
          }

          if (submittingSettingsKeys.has(settingKey)) {
            pendingValue = value
            return
          }

          pendingSettingsSubmissions++

          try {
            submittingSettingsKeys.add(settingKey)
            await electronApi.settings.setSetting.query({key, value})
            submittingSettingsKeys.delete(settingKey)

            if (pendingValue !== undefined) {
              await submitSetting(pendingValue, true)
            }
          } catch (e) {
            console.error(e)
          }

          pendingSettingsSubmissions--

          if (!isDebouncedSubmission && pendingSettingsSubmissions === 0) {
            for (const waitForSettingsFlushedResolveFn of waitForSettingsFlushedResolveFns) {
              waitForSettingsFlushedResolveFn()
            }
            waitForSettingsFlushedResolveFns = []
          }
        }

        watch(() => settingsRefs[settingKey].value, (newValue) => {
          submitSetting(newValue)
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

  function waitForSettingsFlushed(): Promise<void> {
    return new Promise(resolve => waitForSettingsFlushedResolveFns.push(resolve))
  }

  return {
    isInitialized,
    waitForSettingsFlushed,
    ...settingsRefs,
  }
})
