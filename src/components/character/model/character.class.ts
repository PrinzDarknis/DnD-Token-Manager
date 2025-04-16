import { generateID } from "../../../utils";
import { ICharacter } from "./character.interface";
import { IRessource } from "./ressource.interface";

export class Character implements ICharacter {
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

  constructor(oldCharacters: ICharacter[]) {
    const oldIDs = oldCharacters.map((char) => char.name);
    const id = generateID("character", oldIDs);
    this.name = "Name";
    this.id = id;
    this.maxHp = 0;
    this.hp = 0;
    this.ac = 0;
    this.spellslots = {
      "1": { available: 0, used: 0 },
      "2": { available: 0, used: 0 },
      "3": { available: 0, used: 0 },
      "4": { available: 0, used: 0 },
      "5": { available: 0, used: 0 },
      "6": { available: 0, used: 0 },
      "7": { available: 0, used: 0 },
      "8": { available: 0, used: 0 },
      "9": { available: 0, used: 0 },
    };
    this.otherResources = {};
  }

  static restore(data: ICharacter): Character {
    const char = new Character([]);
    if (typeof data != "object") return char;
    char.id = data.id ?? char.id;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function getValue(obj: any, property: string) {
      const propertyParts = property.split(".");
      if (propertyParts[1]) return obj[propertyParts[0]][propertyParts[1]];
      return obj[propertyParts[0]];
    }

    // simple Properties
    for (const property of Character.STANDART_PROPERTES)
      try {
        char.setValue(property, getValue(data, property));
      } catch (e) {
        console.debug(`Error while restoring character`, e);
      }

    if (typeof data.otherResources == "object")
      for (const [resourceName, resource] of Object.entries(
        data.otherResources
      ))
        try {
          char.setValue(`otherResources.${resourceName}`, resource);
        } catch (e) {
          console.debug(`Error while restoring character`, e);
        }

    return char;
  }

  setValue(property: string, value: unknown): void {
    switch (property) {
      case "name":
        this.name = Character.parseString(value);
        return;
      case "hp":
        this.hp = Character.parseNumber(value);
        return;
      case "maxHp":
        this.maxHp = Character.parseNumber(value);
        return;
      case "ac":
        this.ac = Character.parseNumber(value);
        return;

      default: {
        const propertyParts = property.split(".");

        if (propertyParts[0] == "spellslots") {
          const level = propertyParts[1];
          if (!["1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(level))
            throw new Error(`Unkown spelslot level "${level}"`);
          this.spellslots[level as "1"] = Character.parseResource(value);
          return;
        }

        if (propertyParts[0] == "otherResources") {
          const resource = propertyParts[1];
          this.otherResources[resource] = Character.parseResource(value);
          return;
        }

        break;
      }
    }

    throw new Error(`Unkown property "${property}"`);
  }

  deleteOtherResource(name: string): void {
    delete this.otherResources[name];
  }

  toSimpleObject(): ICharacter {
    return JSON.parse(JSON.stringify(this));
  }

  // static
  static readonly STANDART_PROPERTES = [
    "name",
    "hp",
    "maxHp",
    "ac",
    "spellslots.1",
    "spellslots.2",
    "spellslots.3",
    "spellslots.4",
    "spellslots.5",
    "spellslots.6",
    "spellslots.7",
    "spellslots.8",
    "spellslots.9",
  ];

  private static invalideTypeError(expected: string, actual: unknown): Error {
    console.error(`Expected ${expected} but got `, actual);
    return new Error(
      `Invalide Type. Expected: ${expected}, Got: ${typeof actual}`
    );
  }

  private static parseNumber(value: unknown): number {
    if (typeof value != "number" && typeof value != "string")
      throw Character.invalideTypeError("string|number", value);
    const num: number = Number(value);
    if (isNaN(num)) Character.invalideTypeError("number", value);
    return num;
  }

  private static parseString(value: unknown): string {
    if (typeof value != "string")
      throw Character.invalideTypeError("string", value);
    return value;
  }

  private static parseResource(value: unknown): IRessource {
    if (typeof value != "object")
      throw Character.invalideTypeError("IRessource", value);

    const available = Character.parseNumber((value as IRessource).available);
    const used = Character.parseNumber((value as IRessource).used);

    return {
      available,
      used,
    };
  }
}
