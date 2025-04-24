import { Character } from "../../../components";

import { BubblesMetadata } from "./bubbles-metadata.interface";

/**
 * Updates an character with the stat information from bubbles
 * @param bubbles Bubbles Stat Data
 * @param char Character to update
 * @returns true if changes were done, false otherwise
 */
export function bubblesUpdateChar(
  bubbles: BubblesMetadata | undefined,
  char: Character
) {
  // should update
  let shouldUpdate = false;

  if (
    typeof bubbles?.["armor class"] == "number" &&
    bubbles["armor class"] != char.ac
  ) {
    shouldUpdate = true;
    char.setValue("ac", bubbles["armor class"]);
  }

  if (typeof bubbles?.health == "number" && bubbles.health != char.hp) {
    shouldUpdate = true;
    char.setValue("hp", bubbles.health);
  }

  if (
    typeof bubbles?.["max health"] == "number" &&
    bubbles["max health"] != char.maxHp
  ) {
    shouldUpdate = true;
    char.setValue("maxHp", bubbles["max health"]);
  }

  return shouldUpdate;
}
