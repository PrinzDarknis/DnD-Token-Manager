import OBR, { Player } from "@owlbear-rodeo/sdk";
import { PlayerInfo } from "../model";

export class OwlbearPlayer {
  protected readonly ready: Promise<void>;
  constructor(ready: Promise<void>) {
    this.ready = ready;
  }

  protected me?: PlayerInfo;

  async getMe(): Promise<PlayerInfo> {
    await this.ready;
    this.me = {
      name: await OBR.player.getName(),
      id: OBR.player.id,
      connectiionId: await OBR.player.getConnectionId(),
      color: await OBR.player.getColor(),
    };
    return this.me;
  }

  async getParty(): Promise<PlayerInfo[]> {
    await this.ready;
    const party = await OBR.party.getPlayers();
    return await this.mapParty(party);
  }

  async onPartyUpdate(
    onUpdate: (party: PlayerInfo[]) => void
  ): Promise<() => void> {
    await this.ready;
    return OBR.party.onChange(async (party) => {
      onUpdate(await this.mapParty(party));
    });
  }

  private async mapParty(party: Player[]): Promise<PlayerInfo[]> {
    const mappedParty = party.map((player) => this.mapPlayer(player));
    if (!this.me) await this.getMe();
    return [...mappedParty, this.me as PlayerInfo];
  }

  private mapPlayer(player: Player): PlayerInfo {
    return {
      name: player.name,
      id: player.id,
      connectiionId: player.connectionId,
      color: player.color,
    };
  }
}
