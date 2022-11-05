import { uiIpc } from "@/api";

export class TASService {
  static reportCurrentFrameChanged(frame: number) {
    uiIpc.queueSend("tas.currentFrameChanged", {frame})
  }

  static reportTimelineLoaded() {
    uiIpc.queueSend("tas.timelineLoaded")
  }
}
