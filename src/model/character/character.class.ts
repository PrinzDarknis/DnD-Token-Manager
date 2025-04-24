import { generateID } from "../../utils";
import {
  ICharacter,
  ICharacterOtherResources,
  ICharacterSpellslots,
} from "./character.interface";
import { IRessource } from "./ressource.interface";

export class Character implements ICharacter {
  protected _id: string;
  protected _name: string;
  protected _hp: number;
  protected _maxHp: number;
  protected _ac: number;
  protected _spellslots: ICharacterSpellslots;
  protected _otherResources: ICharacterOtherResources;
  protected _lastUpdate: Date;
  protected _lastStatUpdate: Date;

  // getter
  public get id(): string {
    return this._id;
  }
  public get name(): string {
    return this._name;
  }
  public get hp(): number {
    return this._hp;
  }
  public get maxHp(): number {
    return this._maxHp;
  }
  public get ac(): number {
    return this._ac;
  }
  public get spellslots(): ICharacterSpellslots {
    return this._spellslots;
  }
  public get otherResources(): ICharacterOtherResources {
    return this._otherResources;
  }
  public get lastUpdate(): Date {
    return this._lastUpdate;
  }
  public get lastStatUpdate(): Date {
    return this._lastStatUpdate;
  }

  // interactions
  constructor(oldCharacters: ICharacter[]) {
    const oldIDs = oldCharacters.map((char) => char.name);
    const id = generateID("character", oldIDs);
    this._name = "Name";
    this._id = id;
    this._maxHp = 0;
    this._hp = 0;
    this._ac = 0;
    this._spellslots = {
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
    this._otherResources = {};
    this._lastUpdate = new Date();
    this._lastStatUpdate = new Date();
  }

  static restore(data: ICharacter): Character | undefined {
    const char = new Character([]);
    if (typeof data != "object") return undefined;
    char._id = data.id ?? char._id;

    function getValue(obj: ICharacter, property: CharacterStandartProperties) {
      const propertyParts = property.split(".");
      if (propertyParts[1]) {
        const firstPart = propertyParts[0] as "otherResources" | "spellslots";
        const secoundPart = propertyParts[1] as "1";
        return obj[firstPart][secoundPart];
      }

      return obj[property as CharacterStandartPropertiesSimple];
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

    // restore lastUpdate (maybe changed by setter)
    char._lastUpdate = data.lastUpdate ?? new Date();
    char._lastStatUpdate = data.lastStatUpdate ?? new Date();

    return char;
  }

  setValue(property: CharacterStandartProperties, value: unknown): void {
    switch (property) {
      case "name":
        this._name = Character.parseString(value);
        this._lastUpdate = new Date();
        this._lastStatUpdate = new Date();
        return;
      case "hp":
        this._hp = Character.parseNumber(value);
        this._lastUpdate = new Date();
        this._lastStatUpdate = new Date();
        return;
      case "maxHp":
        this._maxHp = Character.parseNumber(value);
        this._lastUpdate = new Date();
        this._lastStatUpdate = new Date();
        return;
      case "ac":
        this._ac = Character.parseNumber(value);
        this._lastUpdate = new Date();
        this._lastStatUpdate = new Date();
        return;
      case "lastUpdate":
        this._lastUpdate = Character.parseDate(value);
        return;
      case "lastStatUpdate":
        this._lastStatUpdate = Character.parseDate(value);
        return;

      default: {
        const propertyParts = property.split(".");

        if (propertyParts[0] == "spellslots") {
          const level = propertyParts[1];
          if (!["1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(level))
            throw new Error(`Unkown spelslot level "${level}"`);
          this._spellslots[level as "1"] = Character.parseResource(value);
          this._lastUpdate = new Date();
          return;
        }

        if (propertyParts[0] == "otherResources") {
          const resource = propertyParts[1];
          this._otherResources[resource] = Character.parseResource(value);
          this._lastUpdate = new Date();
          return;
        }

        break;
      }
    }

    throw new Error(`Unkown property "${property}"`);
  }

  deleteOtherResource(name: string): void {
    delete this._otherResources[name];
    this._lastUpdate = new Date();
  }

  toSimpleObject(): ICharacter {
    return {
      id: this.id,
      name: this.name,
      hp: this.hp,
      maxHp: this.maxHp,
      ac: this.ac,
      spellslots: this.spellslots,
      otherResources: this.otherResources,
      lastUpdate: this.lastUpdate,
      lastStatUpdate: this.lastStatUpdate,
    };
  }

  // static
  static readonly STANDART_PROPERTES: CharacterStandartProperties[] = [
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
    "lastUpdate",
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

  private static parseDate(value: unknown): Date {
    if (!value) return new Date();
    if (typeof value == "string") {
      const date = new Date(value);
      if (isNaN(date.getDate()))
        throw Character.invalideTypeError("Date", value);
      return date;
    }
    if (!(value instanceof Date))
      throw Character.invalideTypeError("Date", value);
    return value;
  }
}

export type CharacterStandartProperties =
  | CharacterStandartPropertiesSimple
  | CharacterStandartPropertiesComplex;

export type CharacterStandartPropertiesSimple =
  | "name"
  | "hp"
  | "maxHp"
  | "ac"
  | "lastUpdate"
  | "lastStatUpdate";

export type CharacterStandartPropertiesComplex =
  | "spellslots.1"
  | "spellslots.2"
  | "spellslots.3"
  | "spellslots.4"
  | "spellslots.5"
  | "spellslots.6"
  | "spellslots.7"
  | "spellslots.8"
  | "spellslots.9"
  | `otherResources.${string}`;
