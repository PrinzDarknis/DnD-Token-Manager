import { ICharacter } from "./character.interface";

export const MOCK_CHARS: ICharacter[] = [
  {
    name: "Max",
    id: "MaxID",
    maxHp: 10,
    hp: 5,
    ac: 15,
    spellslots: {
      "1": { available: 5, used: 3 },
      "2": { available: 4, used: 2 },
      "3": { available: 3, used: 1 },
      "4": { available: 2, used: 0 },
      "5": { available: 1, used: 0 },
      "6": { available: 0, used: 0 },
      "7": { available: 0, used: 0 },
      "8": { available: 0, used: 0 },
      "9": { available: 0, used: 0 },
    },
    otherResources: {
      SteadyAim: { available: 3, used: 0 },
    },
  },
  {
    name: "Daja",
    id: "DajaID",
    maxHp: 10,
    hp: 5,
    ac: 15,
    spellslots: {
      "1": { available: 5, used: 3 },
      "2": { available: 4, used: 2 },
      "3": { available: 3, used: 1 },
      "4": { available: 2, used: 0 },
      "5": { available: 1, used: 0 },
      "6": { available: 0, used: 0 },
      "7": { available: 0, used: 0 },
      "8": { available: 0, used: 0 },
      "9": { available: 0, used: 0 },
    },
    otherResources: {
      Blink: { available: 3, used: 3 },
      MagicStep: { available: 3, used: 3 },
      "Katze Miau": { available: 3, used: 3 },
      Habier: { available: 3, used: 3 },
      Teleport: { available: 3, used: 3 },
      "Shadow Walk": { available: 3, used: 3 },
      Rast: { available: 3, used: 3 },
    },
  },
];
