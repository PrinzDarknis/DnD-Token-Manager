import OBR, { Metadata } from "@owlbear-rodeo/sdk";

import { Character } from "../components";

import { METADATA_CHARACTERS } from "./constants";

export class OwlbearCharacter {
  protected readonly ready: Promise<void>;
  constructor(ready: Promise<void>) {
    this.ready = ready;
  }

  async load(): Promise<Character[]> {
    await this.ready;

    const metadata = await OBR.room.getMetadata();
    return this.metadataToChars(metadata);
  }

  async save(chars: Character[]): Promise<void> {
    await this.ready;

    const data = chars.map((char) => char.toSimpleObject());

    // save
    await OBR.room.setMetadata({
      [METADATA_CHARACTERS]: data,
    });
  }

  async registerOnUpdate(onUpdate: (chars: Character[]) => void) {
    await this.ready;
    OBR.room.onMetadataChange((metadata) =>
      onUpdate(this.metadataToChars(metadata))
    );
  }

  protected metadataToChars(metadata: Metadata): Character[] {
    const data = metadata[METADATA_CHARACTERS];

    if (!Array.isArray(data)) return [];

    return data
      .map((char) => {
        try {
          return Character.restore(char);
        } catch (e) {
          console.error(e);
          return undefined;
        }
      })
      .filter((char) => !!char);
  }
}
