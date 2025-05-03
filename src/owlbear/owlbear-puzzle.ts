import OBR from "@owlbear-rodeo/sdk";

import { PuzzleInfo } from "../model";

import { BROADCAST_PUZZLE_ACTION, BROADCAST_PUZZLE_UPDATE } from "./constants";

interface ActionMessageData {
  action: string;
  actionData: unknown;
  master: string;
}

export class OwlbearPuzzle {
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
    OBR.broadcast.sendMessage(BROADCAST_PUZZLE_UPDATE, puzzleInfo, {
      destination: "ALL",
    });
  }

  async listenUpdate(
    gotUpdate: (puzzleInfo: PuzzleInfo) => void
  ): Promise<() => void> {
    await this.ready;
    const unSubscribe = OBR.broadcast.onMessage(
      BROADCAST_PUZZLE_ACTION,
      async (message) => {
        gotUpdate(message.data as PuzzleInfo);
      }
    );
    return unSubscribe;
  }
}
