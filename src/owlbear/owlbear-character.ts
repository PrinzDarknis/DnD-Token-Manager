import OBR, { Item, Metadata } from "@owlbear-rodeo/sdk";

import { Character, ICharacter } from "../model";
import { debounce, Log } from "../utils";

import {
  HTML_PRODUCTION_PREFIX,
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
    Log.debug("OwlbearCharacter", "loadAll", { chars, metadata });
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
    Log.debug("OwlbearCharacter", "SAVE", char);
    await this.ready;

    // save
    const update: Partial<Metadata> = {};
    update[METADATA_CHARACTER(char.id)] = char.toSimpleObject();

    await OBR.room.setMetadata(update);
    await this.updateToken(char);
    Log.trace("OwlbearCharacter", "_save", update);
  }

  async delete(charId: string): Promise<void> {
    await this.ready;

    // save
    const update: Partial<Metadata> = {
      [METADATA_CHARACTER(charId)]: undefined,
    };
    await OBR.room.setMetadata(update);
    Log.trace("OwlbearCharacte", "delete", update);
  }

  async registerOnUpdate(
    onUpdate?: (char: Character) => void | Promise<void>,
    onUpdateAll?: (chars: Character[]) => void | Promise<void>,
    onDeleteCheck?: (valideIds: string[]) => void | Promise<void>
  ) {
    await this.ready;
    OBR.room.onMetadataChange(async (metadata) => {
      const valideChars: Character[] = [];

      // update chars
      for (const [metakey, metaentry] of Object.entries(metadata)) {
        if (metakey.includes(METADATA_CHARACTER(""))) {
          const char = OwlbearCharacter.metadataToChar(metaentry);
          if (char) {
            await onUpdate?.(char);
            valideChars.push(char);
          }
        }
      }

      await onUpdateAll?.(valideChars);

      // check delete
      await onDeleteCheck?.(valideChars.map((char) => char.id));
    });
  }

  static metadataToChar(metadata: unknown): Character | undefined {
    try {
      return Character.restore(metadata as ICharacter);
    } catch (e) {
      Log.exception(e);
      return undefined;
    }
  }

  async overwriteAll(chars: Character[]): Promise<void> {
    await this.ready;
    const metadata = await OBR.room.getMetadata();
    const update: Partial<Metadata> = {};

    // delete old
    for (const [metakey] of Object.entries(metadata)) {
      if (metakey.includes(METADATA_CHARACTER(""))) {
        update[metakey] = undefined;
      }
    }

    // insert new
    for (const char of chars) {
      char.setValue("hp", char.hp); // update last Edit times
      update[METADATA_CHARACTER(char.id)] = char.toSimpleObject();
    }

    // save
    await OBR.room.setMetadata(update);
    Log.trace("OwlbearCharacte", "overwriteAll", update);
    await this.updateTokenAll(chars);
  }

  // Token-Management
  async setupTokenManagement(): Promise<void> {
    await this.ready;
    await this.setupCharacterAction();
    await OBR.scene.isReady();
    OBR.scene.items.onChange((items) => this.onTokenUpdate(items));
  }

  protected async setupCharacterAction(): Promise<void> {
    await this.ready;
    const devMode = import.meta.env.DEV ?? false;
    const htmlPrefix = devMode ? "" : HTML_PRODUCTION_PREFIX;
    OBR.contextMenu.create({
      id: METADATA_CHARACTER_TOKEN_ACTION,
      icons: [
        {
          icon: `${htmlPrefix}/character.svg`,
          label: "Set Current Character",
          filter: {
            every: [{ key: "layer", value: "CHARACTER" }],
            roles: ["GM"],
          },
        },
      ],
      embed: {
        url: `${htmlPrefix}/html/context-menu/token-set-character.html`,
        height: 50,
      },
    });
  }

  protected async onTokenUpdate(items: Item[]): Promise<void> {
    await this.ready;
    for (const item of items) {
      // is relevant
      const charId = item.metadata[METADATA_CHARACTER_TOKEN];
      if (!charId) continue;
      if (typeof charId != "string") {
        Log.warn(
          "OwlbearCharacter:onTokenUpdate",
          `Unkown Value in ${METADATA_CHARACTER_TOKEN}`,
          charId
        );
        continue;
      }

      // get Char
      const char = await this.loadOne(charId);
      if (!char) continue;

      // get Bubbles
      const bubbles = StatBubblesForDnD.getMetadata(item.metadata);

      // update
      if (StatBubblesForDnD.bubblesUpdateChar(bubbles, char)) {
        Log.debug("OwlbearCharacter", "update on token for char", charId);
        this.save(char);
      }
    }
  }

  protected async updateToken(char: Character): Promise<void> {
    await this.ready;
    await OBR.scene.isReady();
    await OBR.scene.items.updateItems(
      (item) => item.layer == "CHARACTER",
      (items) => {
        for (const item of items) {
          if (item.metadata[METADATA_CHARACTER_TOKEN] == char.id) {
            StatBubblesForDnD.charUpdateBubbles(char, item);
          }
        }
      }
    );
  }

  protected async updateTokenAll(chars: Character[]): Promise<void> {
    await this.ready;
    await OBR.scene.isReady();
    await OBR.scene.items.updateItems(
      (item) => item.layer == "CHARACTER",
      (items) => {
        for (const item of items) {
          const tokenCharId = item.metadata[METADATA_CHARACTER_TOKEN];
          if (!tokenCharId) continue;
          const char = chars.find((char) => char.id == tokenCharId);
          if (!char) continue;
          StatBubblesForDnD.charUpdateBubbles(char, item);
        }
      }
    );
  }

  async getSelectedTokenCharacterId(): Promise<string | undefined> {
    await this.ready;

    // get Selected Items
    const selection = await OBR.player.getSelection();
    if (!selection) return undefined;
    await OBR.scene.isReady();
    const items = await OBR.scene.items.getItems(selection);

    // get ID
    let id: string | undefined | false = false;
    for (const item of items) {
      const currentId: string | undefined = item.metadata[
        METADATA_CHARACTER_TOKEN
      ] as string;
      if (id != currentId && id !== false) return undefined; // miss match in IDs
      id = currentId;
    }

    return id == false ? undefined : id;
  }

  async setSelectedTokenCharacterId(id: string | undefined): Promise<void> {
    if (!id) id = undefined; // empty string to undefined
    await this.ready;

    // get Selected Items
    const selection = await OBR.player.getSelection();
    if (!selection) return;

    // update
    await OBR.scene.items.updateItems(selection, (items) => {
      for (const item of items) {
        item.metadata[METADATA_CHARACTER_TOKEN] = id;
      }
    });
  }
}
