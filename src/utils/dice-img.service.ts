import d4 from "/icons/d4.svg";
import d6 from "/icons/d6.svg";
import d8 from "/icons/d8.svg";
import d10 from "/icons/d10.svg";
import d12 from "/icons/d12.svg";
import d20 from "/icons/d20.svg";

import { DiceType } from "../model";

import { Log } from "./logging";

export function diceImg(dice: DiceType): string {
  switch (dice) {
    case "D4":
      return d4;
    case "D6":
      return d6;
    case "D8":
      return d8;
    case "D10":
      return d10;
    case "D12":
      return d12;
    case "D20":
      return d20;

    default:
      Log.warn("diceImg", "Unkown Dice Type", dice);
      return "";
  }
}
