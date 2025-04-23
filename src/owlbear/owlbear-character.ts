import OBR, { Metadata } from "@owlbear-rodeo/sdk";

import { Character, ICharacter } from "../components";
import { debounce } from "../utils";

import { METADATA_CHARACTER } from "./constants";

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
        const char = OwlbearCharacter.metadataToChar(metaentry as ICharacter);
        if (char) chars[char.id] = char;
      }
    }
    console.debug("OwlbearCharacter", "loadAll", chars);
    return chars;
  }

  async save(char: Character): Promise<void> {
    return debounce(`OwlbearCharacter-save-${char.id}`, () => this._save(char));
  }

  protected async _save(char: Character): Promise<void> {
    await this.ready;

    // save
    const update: Partial<Metadata> = {};
    char.lastUpdate = new Date();
    update[METADATA_CHARACTER(char.id)] = char.toSimpleObject();

    await OBR.room.setMetadata(update);
  }

  async delete(charId: string): Promise<void> {
    await this.ready;

    // save
    const update: Partial<Metadata> = {
      [METADATA_CHARACTER(charId)]: undefined,
    };
    await OBR.room.setMetadata(update);
  }

  async registerOnUpdate(onUpdate: (char: Character) => void | Promise<void>) {
    await this.ready;
    OBR.room.onMetadataChange(async (metadata) => {
      for (const [metakey, metaentry] of Object.entries(metadata)) {
        if (metakey.includes(METADATA_CHARACTER(""))) {
          const char = OwlbearCharacter.metadataToChar(metaentry as ICharacter);
          if (char) await onUpdate(char);
        }
      }
    });
  }

  static metadataToChar(metadata: ICharacter): Character | undefined {
    try {
      return Character.restore(metadata);
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }
}
