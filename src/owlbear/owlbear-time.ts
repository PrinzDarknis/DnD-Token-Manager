import OBR, { Metadata } from "@owlbear-rodeo/sdk";

import { TimeInfo } from "../model";
import { Log } from "../utils";

import { METADATA_TIME } from "./constants";

export class OwlbearTime {
  protected readonly ready: Promise<void>;
  constructor(ready: Promise<void>) {
    this.ready = ready;
  }

  async load(): Promise<TimeInfo> {
    await this.ready;
    const metadata = await OBR.room.getMetadata();
    return this.extractTimeInfo(metadata);
  }

  async registerOnUpdate(
    onUpdate: (timeInfo: TimeInfo) => void | Promise<void>
  ): Promise<() => void> {
    await this.ready;
    return OBR.room.onMetadataChange(async (metadata) => {
      const timeInfo = this.extractTimeInfo(metadata);
      await onUpdate(timeInfo);
      Log.trace("OwlbearTime", "onUpdate", timeInfo);
    });
  }

  async save(timeInfo: TimeInfo): Promise<void> {
    await this.ready;
    const update: Partial<Metadata> = {};
    update[METADATA_TIME] = timeInfo;
    await OBR.room.setMetadata(update);
    Log.trace("OwlbearTime", "save", update);
  }

  private extractTimeInfo(metadata: Metadata): TimeInfo {
    const savedTimeInfo = metadata[METADATA_TIME] as
      | Partial<TimeInfo>
      | undefined;
    return {
      gameDay: savedTimeInfo?.gameDay ?? 1,
      tasks: savedTimeInfo?.tasks ?? [],
    };
  }
}
