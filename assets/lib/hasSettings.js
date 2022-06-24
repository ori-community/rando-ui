import { mapState } from 'vuex'

export const hasSettings = {
  data: () => ({
    settings: {},
  }),
  computed: {
    ...mapState('electron', ['settingsLoaded']),
    ...mapState('electron', {_storeSettings: 'settings'}),
  },
  watch: {
    // Syncing settings from store to local copy
    _storeSettings: {
      deep: true,
      immediate: true,
      handler(storeSettings, previousStoreSettings) {
        for (const key of Object.keys(storeSettings)) {
          if (!previousStoreSettings || storeSettings[key] !== previousStoreSettings[key]) {
            this.$set(this.settings, key, storeSettings[key])
          }
        }
      }
    },

    // Syncing settings from local copy to store
    settings: {
      deep: true,
      handler(settings) {
        for (const key of Object.keys(settings)) {
          if (this._storeSettings[key] !== settings[key]) {
            this.$store.dispatch('electron/setSetting', {
              key,
              value: settings[key],
            })
          }
        }
      }
    },
  }
}
