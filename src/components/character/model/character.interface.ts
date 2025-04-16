import { IRessource } from "./ressource.interface";

export interface ICharacter {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  ac: number;
  spellslots: {
    "1": IRessource;
    "2": IRessource;
    "3": IRessource;
    "4": IRessource;
    "5": IRessource;
    "6": IRessource;
    "7": IRessource;
    "8": IRessource;
    "9": IRessource;
  };
  otherResources: { [name: string]: IRessource };
}
