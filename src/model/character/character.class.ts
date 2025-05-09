import { generateID, Log } from "../../utils";

import {
  ICharacter,
  ICharacterOtherResources,
  ICharacterSpellslots,
} from "./character.interface";
import { DiceType } from "./dice.type";
import { IRessource } from "./ressource.interface";

export class Character implements ICharacter {
  protected _id: string;
  protected _name: string;
  protected _hp: number;
  protected _maxHp: number;
  protected _maxHpMod: number;
  protected _ac: number;
  protected _hitDice: DiceType;
  protected _hitDiceMax: number;
  protected _hitDiceRemaining: number;
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
  public get maxHpMod(): number {
    return this._maxHpMod;
  }
  public get ac(): number {
    return this._ac;
  }
  public get hitDice(): DiceType {
    return this._hitDice;
  }
  public get hitDiceMax(): number {
    return this._hitDiceMax;
  }
  public get hitDiceRemaining(): number {
    return this._hitDiceRemaining;
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
    this._maxHpMod = 0;
    this._hp = 0;
    this._ac = 0;
    this._hitDice = "D8";
    this._hitDiceMax = 1;
    this._hitDiceRemaining = 0;
    this._spellslots = {
      "1": { available: 0, used: 0, shortReset: false },
      "2": { available: 0, used: 0, shortReset: false },
      "3": { available: 0, used: 0, shortReset: false },
      "4": { available: 0, used: 0, shortReset: false },
      "5": { available: 0, used: 0, shortReset: false },
      "6": { available: 0, used: 0, shortReset: false },
      "7": { available: 0, used: 0, shortReset: false },
      "8": { available: 0, used: 0, shortReset: false },
      "9": { available: 0, used: 0, shortReset: false },
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
        Log.debug("Character", `Error while restoring character`, e);
      }

    if (typeof data.otherResources == "object")
      for (const [resourceName, resource] of Object.entries(
        data.otherResources
      ))
        try {
          char.setValue(`otherResources.${resourceName}`, resource);
        } catch (e) {
          Log.debug("Character", `Error while restoring character`, e);
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
      case "maxHpMod":
        this._maxHpMod = Character.parseNumber(value);
        this._lastUpdate = new Date();
        this._lastStatUpdate = new Date();
        return;
      case "ac":
        this._ac = Character.parseNumber(value);
        this._lastUpdate = new Date();
        this._lastStatUpdate = new Date();
        return;
      case "hitDice":
        this._hitDice = Character.parseDiceType(value);
        this._lastUpdate = new Date();
        return;
      case "hitDiceMax":
        this._hitDiceMax = Character.parseNumber(value);
        this._lastUpdate = new Date();
        return;
      case "hitDiceRemaining":
        this._hitDiceRemaining = Character.parseNumber(value);
        this._lastUpdate = new Date();
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
      maxHpMod: this.maxHpMod,
      ac: this.ac,
      hitDice: this.hitDice,
      hitDiceMax: this.hitDiceMax,
      hitDiceRemaining: this.hitDiceRemaining,
      spellslots: this.spellslots,
      otherResources: this.otherResources,
      lastUpdate: this.lastUpdate,
      lastStatUpdate: this.lastStatUpdate,
    };
  }

  shortRest(): void {
    Object.values(this.spellslots).forEach((ressource: IRessource) => {
      if (ressource.shortReset) ressource.used = 0;
    });
    Object.values(this.otherResources).forEach((ressource) => {
      if (ressource.shortReset) ressource.used = 0;
    });
  }

  longRest(): void {
    this.setValue("hp", this.maxHp);
    this.setValue("maxHpMod", 0);
    this.setValue("hitDiceRemaining", this.hitDiceMax);
    Object.values(this.spellslots).forEach((ressource: IRessource) => {
      ressource.used = 0;
    });
    Object.values(this.otherResources).forEach((ressource) => {
      ressource.used = 0;
    });
  }

  // static
  static readonly STANDART_PROPERTES: CharacterStandartProperties[] = [
    "name",
    "hp",
    "maxHp",
    "maxHpMod",
    "ac",
    "hitDice",
    "hitDiceMax",
    "hitDiceRemaining",
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
    Log.error("Character", `Expected ${expected} but got `, actual);
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

  private static parseBoolean(
    value: unknown,
    hideError: boolean = false
  ): boolean {
    if (typeof value != "boolean")
      if (hideError) return false;
      else throw Character.invalideTypeError("string", value);
    return value;
  }

  private static parseResource(value: unknown): IRessource {
    if (typeof value != "object")
      throw Character.invalideTypeError("IRessource", value);

    const available = Character.parseNumber((value as IRessource).available);
    const used = Character.parseNumber((value as IRessource).used);
    const shortReset = Character.parseBoolean(
      (value as IRessource).shortReset,
      true
    );

    return {
      available,
      used,
      shortReset,
    };
  }

  private static parseDate(value: unknown): Date {
    if (!value) return new Date();
    if (typeof value == "string") {
      const date = new Date(value);
      if (isNaN(date.getTime()))
        throw Character.invalideTypeError("Date", value);
      return date;
    }
    if (!(value instanceof Date))
      throw Character.invalideTypeError("Date", value);
    return value;
  }

  private static parseDiceType(value: unknown): DiceType {
    if (typeof value != "string")
      throw Character.invalideTypeError("DiceType", value);

    switch (value as DiceType) {
      case "D4":
        return "D4";
      case "D6":
        return "D6";
      case "D8":
        return "D8";
      case "D10":
        return "D10";
      case "D12":
        return "D12";
      case "D20":
        return "D20";

      default:
        throw Character.invalideTypeError("DiceType", value);
    }
  }
}

export type CharacterStandartProperties =
  | CharacterStandartPropertiesSimple
  | CharacterStandartPropertiesComplex;

export type CharacterStandartPropertiesSimple =
  | "name"
  | "hp"
  | "maxHp"
  | "maxHpMod"
  | "ac"
  | "hitDice"
  | "hitDiceMax"
  | "hitDiceRemaining"
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
