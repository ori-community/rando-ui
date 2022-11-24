import { uiIpc } from "@/api";

export class TASService {
  static reportLoadingStateChanged(state: string) {
    uiIpc.queueSend("tas.loadingStateChanged", {state})
  }

  static reportStateChanged(state: any) {
    uiIpc.queueSend("tas.stateChanged", {state})
  }

  static reportTimelineLoaded(tasConfig: any) {
    uiIpc.queueSend("tas.timelineLoaded", {tasConfig})
  }
}
