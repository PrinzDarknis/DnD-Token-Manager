import { Monster } from "./monster.interface";
import { SourceBestiary } from "./sources";
import { MonsterSource } from "./sources/monster-source.class";

export abstract class MonsterManager {
  //region List Management

  static monsters: Monster[] = [];
  private static sources: MonsterSource[] = [new SourceBestiary()];

  static async getMonsters(): Promise<Monster[]> {
    if (this.monsters.length > 0) {
      return this.monsters;
    }

    await this.buildMonsterIndex();
    return this.monsters;
  }

  private static async buildMonsterIndex(): Promise<void> {
    const lists = await Promise.all(
      this.sources.map((source) => source.getList()),
    );
    this.monsters = lists.flat();
    this.listenToSources(); // Execute only once is ensured by the method itself
    this.notifyUpdate();
  }

  //endregion

  //region Notification System

  private static updateListeners: ((monsters: Monster[]) => void)[] = [];
  protected static notifyUpdate(): void {
    for (const listener of this.updateListeners) {
      listener(this.monsters);
    }
  }
  static onUpdate(callback: (monsters: Monster[]) => void): void {
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

  //endregion
}
