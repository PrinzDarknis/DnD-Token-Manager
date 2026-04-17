import { Monster } from "./monster.interface";
import { SourceBestiary } from "./sources";
import { MonsterSource } from "./sources/monster-source.class";

export abstract class MonsterManager {
  //region List Management

  static monsters: { [id: string]: Monster } = {};
  private static sources: MonsterSource[] = [new SourceBestiary()];

  static async getMonsters(): Promise<{ [id: string]: Monster }> {
    if (Object.keys(this.monsters).length > 0) {
      return this.monsters;
    }

    await this.buildMonsterIndex();
    return this.monsters;
  }

  private static async buildMonsterIndex(): Promise<void> {
    const lists = await Promise.all(
      this.sources.map((source) => source.getList()),
    );
    this.monsters = lists.flat().reduce(
      (index, monster) => {
        const id = `${monster.source}:${monster.name}`;
        index[id] = monster;
        return index;
      },
      {} as { [id: string]: Monster },
    );
    this.listenToSources(); // Execute only once is ensured by the method itself
    this.notifyUpdate();
  }

  private static getSource(monster: Monster): MonsterSource {
    const source = this.sources.find((s) => s.SOURCE_NAME === monster.source);
    if (!source) {
      throw new Error(
        `No source found for monster "${monster.name}" with source "${monster.source}".`,
      );
    }
    return source;
  }

  //endregion

  //region Monster Management

  static async updateMonster(monster: Monster): Promise<Monster> {
    const source = this.getSource(monster);
    const updatedMonster = await source.updateMonster(monster); // Update List is handle by the source
    return updatedMonster;
  }

  static overrideImage(monster: Monster, newImgLink: string): void {
    const source = this.getSource(monster);
    source.overwriteImage(monster, newImgLink);
  }

  //endregion

  //region Notification System

  private static updateListeners: ((monsters: {
    [id: string]: Monster;
  }) => void)[] = [];
  protected static notifyUpdate(): void {
    for (const listener of this.updateListeners) {
      listener(this.monsters);
    }
  }
  static onUpdate(
    callback: (monsters: { [id: string]: Monster }) => void,
  ): void {
    this.updateListeners.push(callback);
  }

  private static isListeningToSources: boolean = false;
  private static listenToSources(): void {
    if (this.isListeningToSources) return;

    this.isListeningToSources = true;
    for (const source of this.sources) {
      source.onUpdate(() => this.buildMonsterIndex());
    }
  }

  //endregion

  //region Helper functions

  /**
   * Parses a challenge rating string into a number for easier comparison and sorting.
   * - If the input is a fraction (e.g., "1/2"), it returns the decimal equivalent (0.5).
   * - If the input is a whole number (e.g., "3"), it returns that number as a numeric value.
   * - If the input is invalid or not provided, it returns `Number.POSITIVE_INFINITY` to indicate an undefined or infinitely high challenge rating.
   * @param challengeRating The challenge rating string to parse.
   * @returns The numeric value of the challenge rating, or `Number.POSITIVE_INFINITY` if invalid.
   */
  static parseChallengeRating(challengeRating?: string): number {
    if (!challengeRating) {
      return Number.POSITIVE_INFINITY;
    }

    const normalized = challengeRating.trim();
    if (!normalized) {
      return Number.POSITIVE_INFINITY;
    }

    if (normalized.includes("/")) {
      const [numeratorRaw, denominatorRaw] = normalized.split("/");
      const numerator = Number(numeratorRaw);
      const denominator = Number(denominatorRaw);

      if (
        !Number.isFinite(numerator) ||
        !Number.isFinite(denominator) ||
        denominator === 0
      ) {
        return Number.POSITIVE_INFINITY;
      }

      return numerator / denominator;
    }

    const asNumber = Number(normalized);
    if (!Number.isFinite(asNumber)) {
      return Number.POSITIVE_INFINITY;
    }

    return asNumber;
  }

  /**
   * Calculates the ability modifier for a given ability score.
   * @param score The ability score to calculate the modifier for.
   * @returns The ability modifier as a string, with a "+" or "-" sign.
   */
  static getAbilityModifier(score?: number): string {
    if (typeof score !== "number" || !Number.isFinite(score)) {
      return "--";
    }

    const modifier = Math.floor((score - 10) / 2);
    const sign = modifier >= 0 ? "+" : "";
    return `${sign}${modifier}`;
  }

  static getXPValue(challengeRating?: string): number {
    const cr = this.parseChallengeRating(challengeRating);
    switch (cr) {
      case 0:
        return 10;
      case 1 / 8:
        return 25;
      case 1 / 4:
        return 50;
      case 1 / 2:
        return 100;
      case 1:
        return 200;
      case 2:
        return 450;
      case 3:
        return 700;
      case 4:
        return 1100;
      case 5:
        return 1800;
      case 6:
        return 2300;
      case 7:
        return 2900;
      case 8:
        return 3900;
      case 9:
        return 5000;
      case 10:
        return 5900;
      case 11:
        return 7200;
      case 12:
        return 8400;
      case 13:
        return 10000;
      case 14:
        return 11500;
      case 15:
        return 13000;
      case 16:
        return 15000;
      case 17:
        return 18000;
      case 18:
        return 20000;
      case 19:
        return 22000;
      case 20:
        return 25000;
      case 21:
        return 33000;
      case 22:
        return 41000;
      case 23:
        return 50000;
      case 24:
        return 62000;
      case 25:
        return 75000;
      case 26:
        return 90000;
      case 27:
        return 105000;
      case 28:
        return 120000;
      case 29:
        return 135000;
      case 30:
        return 155000;
      default:
        return 0;
    }
  }

  //endregion
}
