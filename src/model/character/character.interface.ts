import { IRessource } from "./ressource.interface";

export interface ICharacter {
  readonly id: string;
  name: string;
  hp: number;
  maxHp: number;
  maxHpMod: number;
  ac: number;
  readonly spellslots: ICharacterSpellslots;
  readonly otherResources: ICharacterOtherResources;
  readonly lastUpdate: Date;
  readonly lastStatUpdate: Date; // for sync with Bubbles Extension
}

export interface ICharacterSpellslots {
  "1": IRessource;
  "2": IRessource;
  "3": IRessource;
  "4": IRessource;
  "5": IRessource;
  "6": IRessource;
  "7": IRessource;
  "8": IRessource;
  "9": IRessource;
}

export interface ICharacterOtherResources {
  [name: string]: IRessource;
}
