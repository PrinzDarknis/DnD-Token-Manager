import { Metadata } from "@owlbear-rodeo/sdk";

import { Log } from "../../../utils";

import { PROJEKT_IDENTIFIER } from "../../constants";

import { BubblesMetadata } from "./bubbles-metadata.interface";
import { METADATA_TAG } from "./constants";

export function createCopyOfMetadata(
  metadata: Metadata
): BubblesMetadata | undefined {
  const bubbles = metadata[METADATA_TAG] as BubblesMetadata;

  if (!bubbles) return undefined;
  if (typeof bubbles != "object") {
    Log.warn(
      PROJEKT_IDENTIFIER,
      "BubblesAdapter",
      "getMetadata",
      "unkown Metadata format",
      bubbles
    );
    return undefined;
  }

  const copy: BubblesMetadata = {
    "armor class": bubbles["armor class"],
    "de.prinzdarknis.dnd-token-manager/sync":
      bubbles["de.prinzdarknis.dnd-token-manager/sync"],
    "max health": bubbles["max health"],
    "temporary health": bubbles["temporary health"],
    health: bubbles.health,
  };

  return copy;
}
