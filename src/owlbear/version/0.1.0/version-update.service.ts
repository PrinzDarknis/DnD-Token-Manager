import OBR, { Metadata } from "@owlbear-rodeo/sdk";

import { Log } from "../../../utils";

import { METADATA_CHARACTER } from "../../constants";

import { OwlbearCharacter_0_1_0 } from "./owlbear-character";
// import { METADATA_CHARACTERS } from "./constants";

export async function versionUpdata_0_1_0(ready: Promise<void>): Promise<void> {
  // Characters
  {
    // load
    const obChars = new OwlbearCharacter_0_1_0(ready);
    const oldChars = (await obChars.load()) ?? [];

    // transform
    if (oldChars.length > 0) {
      Log.debug(
        "versionUpdata_0_1_0",
        "found old chars",
        "procede to update chars"
      );

      const data = oldChars.map((char) => char.toSimpleObject());

      // save
      const update: Partial<Metadata> = {};
      for (const char of data) {
        update[METADATA_CHARACTER(char.id)] = char;
      }

      await OBR.room.setMetadata(update);
    }

    // clean up
    // await OBR.room.setMetadata({ // TODO fix
    //   [METADATA_CHARACTERS]: undefined,
    // });
  }
}
