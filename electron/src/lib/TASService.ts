import { uiIpc } from "@/api";

export class TASService {
  static reportStateChanged(state: any) {
    uiIpc.queueSend("tas.stateChanged", {state})
  }

  static reportTimelineLoaded(tasConfig: any) {
    uiIpc.queueSend("tas.timelineLoaded", {tasConfig})
  }
}
