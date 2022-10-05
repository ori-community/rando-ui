import { AxiosAPI } from "~/assets/lib/api/AxiosAPI";
import { EventBus } from "~/assets/lib/EventBus";

export class UISeedGenerator extends AxiosAPI {
  async generateSeed(universePreset) {
    const data = await this.axios.$post('/seeds', universePreset)

    if (data.warnings && data.warnings.includes('WARN')) {
      EventBus.$emit('notification', {
        message: data.warnings,
        color: 'warning',
      })
    }

    return data
  }
}
