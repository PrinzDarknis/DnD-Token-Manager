import OBR from "@owlbear-rodeo/sdk";
import { OwlbearCharacter } from "./owlbear-character";

export class Owlbear {
  public readonly character: OwlbearCharacter;

  protected readonly ready: Promise<void>;

  constructor() {
    this.ready = new Promise((resolve) => {
      OBR.onReady(() => {
        resolve();
      });
    });
    this.character = new OwlbearCharacter(this.ready);
  }
}
