import OBR, { Metadata } from "@owlbear-rodeo/sdk";

import { PuzzleInfo } from "../model";

import {
  BROADCAST_PUZZLE_ACTION,
  BROADCAST_PUZZLE_UPDATE,
  METADATA_PUZZLE_CURRENT,
} from "./constants";

interface ActionMessageData {
  action: string;
  actionData: unknown;
  master: string;
}

export class OwlbearPuzzle {
  private readonly timeUntilTakeOver = 5 * 1000;

  protected readonly ready: Promise<void>;
  constructor(ready: Promise<void>) {
    this.ready = ready;
  }

  async sendAction(
    action: string,
    actionData: unknown,
    master: string
  ): Promise<void> {
    await this.ready;
    const data: ActionMessageData = { action, actionData, master };
    OBR.broadcast.sendMessage(BROADCAST_PUZZLE_ACTION, data, {
      destination: "ALL",
    });
    this.readyTakeOver(action, actionData);
  }

  async listenAction(
    gotAction: (action: string, actionData: unknown) => void
  ): Promise<() => void> {
    await this.ready;
    const unSubscribe = OBR.broadcast.onMessage(
      BROADCAST_PUZZLE_ACTION,
      async (message) => {
        const { action, actionData, master } =
          message.data as ActionMessageData;
        if ((await OBR.player.getConnectionId()) != master) return;
        gotAction(action, actionData);
      }
    );
    return unSubscribe;
  }

  async sendUpdate(puzzleInfo: PuzzleInfo): Promise<void> {
    await this.ready;
    puzzleInfo.master = await OBR.player.getConnectionId();
    OBR.broadcast.sendMessage(BROADCAST_PUZZLE_UPDATE, puzzleInfo, {
      destination: "ALL",
    });
  }

  async listenUpdate(
    gotUpdate: (puzzleInfo: PuzzleInfo) => void
  ): Promise<() => void> {
    await this.ready;
    const unSubscribe = OBR.broadcast.onMessage(
      BROADCAST_PUZZLE_UPDATE,
      async (message) => {
        this.clearTakeOver();
        gotUpdate(message.data as PuzzleInfo);
      }
    );
    return unSubscribe;
  }

  // Take Over
  private takeOverTimeout?: NodeJS.Timeout;
  private readyTakeOver(action: string, actionData: unknown): void {
    this.clearTakeOver();
    this.takeOverTimeout = setTimeout(async () => {
      const myId = await OBR.player.getConnectionId();
      this.sendAction(action, actionData, myId);
    }, this.timeUntilTakeOver);
  }

  private clearTakeOver(): void {
    clearTimeout(this.takeOverTimeout);
  }

  // Current Puzzle
  async loadCurrentPuzzle(): Promise<PuzzleInfo | undefined> {
    await this.ready;

    const metadata = await OBR.room.getMetadata();
    const data: PuzzleInfo = metadata[METADATA_PUZZLE_CURRENT] as PuzzleInfo;
    if (!data || !data.puzzle) return undefined;
    data.processing = false;
    return data;
  }

  async saveCurrentPuzzle(puzzleInfo: PuzzleInfo) {
    await this.ready;

    // save
    const update: Partial<Metadata> = {};
    update[METADATA_PUZZLE_CURRENT] = puzzleInfo;

    await OBR.room.setMetadata(update);
  }
}
