import { uiIpc } from "@/api";

export class TASService {
  static reportStateChanged(state: any) {
    uiIpc.queueSend("tas.stateChanged", {state})
  }

  static reportTimelineLoaded() {
    uiIpc.queueSend("tas.timelineLoaded")
  }
}
