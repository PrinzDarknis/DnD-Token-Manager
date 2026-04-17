import { Monster } from "../monster.interface";

export abstract class MonsterSource {
  protected list: Monster[] = [];

  protected abstract readonly SOURCE_NAME: string;

  protected abstract _updateList(): Promise<Monster[]>;
  protected abstract _updateMonster(monster: Monster): Promise<Monster>;

  async getList(): Promise<Monster[]> {
    if (this.list.length > 0) {
      return this.list;
    }

    // Check local storage first
    const storedMonsters = localStorage.getItem(`monsters-${this.SOURCE_NAME}`);
    if (storedMonsters) {
      try {
        this.list = JSON.parse(storedMonsters);
      } catch {
        // Ignore JSON parse errors
      }
    }

    // If no monsters are found in local storage, fetch from the source
    if (this.list.length === 0) {
      this.list = await this._updateList();
      this.saveToLocalStorage();
    }

    this.notifyUpdate();
    return this.list;
  }
  async updateList(): Promise<Monster[]> {
    this.list = await this._updateList();
    this.saveToLocalStorage();
    this.notifyUpdate();
    return this.list;
  }
  async updateMonster(monster: Monster): Promise<Monster> {
    const updatedMonster = await this._updateMonster(monster);
    this.saveToLocalStorage();
    this.notifyUpdate();
    return updatedMonster;
  }

  protected saveToLocalStorage(): void {
    try {
      localStorage.setItem(
        `monsters-${this.SOURCE_NAME}`,
        JSON.stringify(this.list),
      );
    } catch {
      // Ignore local storage errors
    }
  }

  //region Notification System
  private updateListeners: ((monsters: Monster[]) => void)[] = [];
  protected notifyUpdate(): void {
    for (const listener of this.updateListeners) {
      listener(this.list);
    }
  }
  onUpdate(callback: (monsters: Monster[]) => void): void {
    this.updateListeners.push(callback);
  }

  //endregion
}
