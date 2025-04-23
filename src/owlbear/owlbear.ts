import OBR from "@owlbear-rodeo/sdk";
import { OwlbearCharacter } from "./owlbear-character";
import { versionUpdata } from "./version";

export class Owlbear {
  public readonly character: OwlbearCharacter;

  protected readonly ready: Promise<void>;

  constructor() {
    this.ready = new Promise((resolve) => {
      OBR.onReady(async () => {
        try {
          await versionUpdata(Promise.resolve());
        } catch (error) {
          console.error("Error while updation Version", error);
        }
        resolve();
      });
    });
    this.character = new OwlbearCharacter(this.ready);
  }

  async isGM(): Promise<boolean> {
    await this.ready;
    const role = await OBR.player.getRole();
    return role == "GM";
  }
}
