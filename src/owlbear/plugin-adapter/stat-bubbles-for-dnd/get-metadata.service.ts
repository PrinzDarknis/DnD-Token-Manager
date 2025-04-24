import { Metadata } from "@owlbear-rodeo/sdk";

import { Log } from "../../../utils";

import { PROJEKT_IDENTIFIER } from "../../constants";

import { BubblesMetadata } from "./bubbles-metadata.interface";
import { METADATA_TAG } from "./constants";

export function getMetadata(metadata: Metadata): BubblesMetadata | undefined {
  const bubbles = metadata[METADATA_TAG];

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

  return bubbles;
}
