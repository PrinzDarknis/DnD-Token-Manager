import OBR from "@owlbear-rodeo/sdk";

import { Log } from "../utils";

import { versionUpdata } from "./version";
import { OwlbearCharacter } from "./owlbear-character";
import { OwlbearSettings } from "./owlbear-settings";
import { OwlbearPuzzle } from "./owlbear-puzzle";
import { OwlbearTime } from "./owlbear-time";
import { OwlbearPlayer } from "./owlbear-player";

export class Owlbear {
  public readonly character: OwlbearCharacter;
  public readonly settings: OwlbearSettings;
  public readonly puzzle: OwlbearPuzzle;
  public readonly time: OwlbearTime;
  public readonly player: OwlbearPlayer;

  protected readonly ready: Promise<void>;

  constructor() {
    this.ready = new Promise((resolve) => {
      OBR.onReady(async () => {
        // update
        try {
          await versionUpdata(Promise.resolve());
        } catch (error) {
          Log.error("Owlbear", "Error while updation Version", error);
        }

        // fin
        resolve();
      });
    });
    this.character = new OwlbearCharacter(this.ready);
    this.settings = new OwlbearSettings(this.ready);
    this.puzzle = new OwlbearPuzzle(this.ready);
    this.time = new OwlbearTime(this.ready);
    this.player = new OwlbearPlayer(this.ready);
  }

  async isGM(): Promise<boolean> {
    await this.ready;
    const role = await OBR.player.getRole();
    return role == "GM";
  }

  async setupBackground(): Promise<void> {
    await this.ready;
    await this.character.setupTokenManagement();
    await this.settings.setupMessageListener();
  }
}
