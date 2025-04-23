import OBR, { Item, Metadata } from "@owlbear-rodeo/sdk";

import { Character, ICharacter } from "../components";
import { debounce } from "../utils";

import {
  METADATA_CHARACTER,
  METADATA_CHARACTER_TOKEN,
  METADATA_CHARACTER_TOKEN_ACTION,
} from "./constants";
import { StatBubblesForDnD } from "./plugin-adapter";

export class OwlbearCharacter {
  protected readonly ready: Promise<void>;
  constructor(ready: Promise<void>) {
    this.ready = ready;
  }

  async loadAll(): Promise<{
    [id: string]: Character;
  }> {
    await this.ready;
    const metadata = await OBR.room.getMetadata();
    const chars: {
      [id: string]: Character;
    } = {};
    for (const [metakey, metaentry] of Object.entries(metadata)) {
      if (metakey.includes(METADATA_CHARACTER(""))) {
        const char = OwlbearCharacter.metadataToChar(metaentry);
        if (char) chars[char.id] = char;
      }
    }
    console.debug("OwlbearCharacter", "loadAll", chars);
    return chars;
  }

  async loadOne(id: string): Promise<Character | undefined> {
    const metadata = await OBR.room.getMetadata();
    const metaChar = metadata[METADATA_CHARACTER(id)];
    return OwlbearCharacter.metadataToChar(metaChar);
  }

  async save(char: Character): Promise<void> {
    return debounce(`OwlbearCharacter-save-${char.id}`, () => this._save(char));
  }

  protected async _save(char: Character): Promise<void> {
    console.debug("SAVE", char);
    await this.ready;

    // save
    const update: Partial<Metadata> = {};
    char.lastUpdate = new Date();
    update[METADATA_CHARACTER(char.id)] = char.toSimpleObject();

    await OBR.room.setMetadata(update);
    await this.updateToken(char);
  }

  async delete(charId: string): Promise<void> {
    await this.ready;

    // save
    const update: Partial<Metadata> = {
      [METADATA_CHARACTER(charId)]: undefined,
    };
    await OBR.room.setMetadata(update);
  }

  async registerOnUpdate(
    onUpdate: (char: Character) => void | Promise<void>,
    onDeleteCheck: (valideIds: string[]) => void | Promise<void>
  ) {
    await this.ready;
    OBR.room.onMetadataChange(async (metadata) => {
      const valideIds: string[] = [];

      // update chars
      for (const [metakey, metaentry] of Object.entries(metadata)) {
        if (metakey.includes(METADATA_CHARACTER(""))) {
          const char = OwlbearCharacter.metadataToChar(metaentry);
          if (char) {
            await onUpdate(char);
            valideIds.push(char.id);
          }
        }
      }

      // check delete
      await onDeleteCheck(valideIds);
    });
  }

  static metadataToChar(metadata: unknown): Character | undefined {
    try {
      return Character.restore(metadata as ICharacter);
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  // Token-Management
  public selectedIdTemp: string = "";
  setupTokenManagement(): void {
    this.setupCharacterAction();
    OBR.scene.items.onChange((items) => this.onTokenUpdate(items));
  }

  protected setupCharacterAction(): void {
    const devMode = import.meta.env.DEV ?? false;
    OBR.contextMenu.create({
      id: METADATA_CHARACTER_TOKEN_ACTION,
      icons: [
        {
          icon: devMode ? "/character.svg" : "/DnD-Token-Manager/character.svg",
          label: "Set Current Character",
          filter: {
            every: [{ key: "layer", value: "CHARACTER" }],
            roles: ["GM"],
          },
        },
      ],
      onClick: async (context) => {
        if (this.selectedIdTemp) {
          await OBR.scene.items.updateItems(context.items, (items) => {
            for (const item of items) {
              item.metadata[METADATA_CHARACTER_TOKEN] = this.selectedIdTemp;
            }
          });
          const char = await this.loadOne(this.selectedIdTemp);
          if (char) await this.updateToken(char);
        }
      },
    });
  }

  protected async onTokenUpdate(items: Item[]): Promise<void> {
    for (const item of items) {
      // is relevant
      const charId = item.metadata[METADATA_CHARACTER_TOKEN];
      if (!charId) return;
      if (typeof charId != "string") {
        console.warn(`Unkown Value in ${METADATA_CHARACTER_TOKEN}`, charId);
        return;
      }

      // get Char
      const char = await this.loadOne(charId);
      if (!char) return;

      // get Bubbles
      const bubbles = StatBubblesForDnD.getMetadata(item.metadata);

      // should update
      let shouldUpdate = false;

      if (
        typeof bubbles?.["armor class"] == "number" &&
        bubbles["armor class"] != char.ac
      ) {
        shouldUpdate = true;
        char.ac = bubbles["armor class"];
      }

      if (typeof bubbles?.health == "number" && bubbles.health != char.ac) {
        shouldUpdate = true;
        char.hp = bubbles.health;
      }

      if (
        typeof bubbles?.["max health"] == "number" &&
        bubbles["max health"] != char.ac
      ) {
        shouldUpdate = true;
        char.maxHp = bubbles["max health"];
      }

      // update
      if (shouldUpdate) this.save(char);
    }
  }

  protected async updateToken(char: Character): Promise<void> {
    await OBR.scene.items.updateItems(
      (item) => item.layer == "CHARACTER",
      (items) => {
        for (const item of items) {
          if (item.metadata[METADATA_CHARACTER_TOKEN] == char.id) {
            const bubbles = StatBubblesForDnD.getMetadata(item.metadata) ?? {};
            bubbles["armor class"] = char.ac;
            bubbles.health = char.hp;
            bubbles["max health"] = char.maxHp;
            item.metadata[StatBubblesForDnD.METADATA_TAG] = bubbles;
          }
        }
      }
    );
  }
}
