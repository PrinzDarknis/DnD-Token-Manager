import { Item } from "@owlbear-rodeo/sdk";

import { Character } from "../../../model";

import { METADATA_SYNC } from "../../constants";
import { Owlbear } from "../..";

import { getMetadata } from "./get-metadata.service";
import { METADATA_TAG } from "./constants";

/**
 * Updates the stat information from bubbles with the stats of an character
 * @param char Character to use as data source
 * @param item Item to update Bubbles Stat Data of
 * @returns true if changes were done, false otherwise
 */
export function charUpdateBubbles(char: Character, item: Item): boolean {
  if (!Owlbear.settings.get("plugin-bubbles")) return false;

  const bubbles = getMetadata(item.metadata) ?? {};

  // should update
  if (
    bubbles[METADATA_SYNC] &&
    new Date(bubbles[METADATA_SYNC]) >= char.lastStatUpdate
  )
    return false;

  bubbles["armor class"] = char.ac;
  bubbles.health = char.hp;
  bubbles["max health"] = char.maxHp + char.maxHpMod;
  bubbles[METADATA_SYNC] = char.lastStatUpdate.toString();
  item.metadata[METADATA_TAG] = bubbles;
  return true;
}
