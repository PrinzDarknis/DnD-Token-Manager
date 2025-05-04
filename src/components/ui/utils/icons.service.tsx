import { ReactNode } from "react";

import "./icons.css";

import moon00 from "/icons/moon/moon 00.svg";
import moon01 from "/icons/moon/moon 01.svg";
import moon02 from "/icons/moon/moon 02.svg";
import moon03 from "/icons/moon/moon 03.svg";
import moon04 from "/icons/moon/moon 04.svg";
import moon05 from "/icons/moon/moon 05.svg";
import moon06 from "/icons/moon/moon 06.svg";
import moon07 from "/icons/moon/moon 07.svg";
import moon08 from "/icons/moon/moon 08.svg";
import moon09 from "/icons/moon/moon 09.svg";
import moon10 from "/icons/moon/moon 10.svg";
import moon11 from "/icons/moon/moon 11.svg";
import moon12 from "/icons/moon/moon 12.svg";
import moon13 from "/icons/moon/moon 13.svg";

import { cssClass, Log } from "../../../utils";

type Color =
  | "red"
  | "darkred"
  | "gray"
  | "ligthgray"
  | "dimgray"
  | "white"
  | "black";

export function moonIcons(phase: number, color: Color): ReactNode {
  switch (phase) {
    case 0:
      return svgToImg(moon00, { [color]: true }, `moon ${phase}`);
    case 1:
      return svgToImg(moon01, { [color]: true }, `moon ${phase}`);
    case 2:
      return svgToImg(moon02, { [color]: true }, `moon ${phase}`);
    case 3:
      return svgToImg(moon03, { [color]: true }, `moon ${phase}`);
    case 4:
      return svgToImg(moon04, { [color]: true }, `moon ${phase}`);
    case 5:
      return svgToImg(moon05, { [color]: true }, `moon ${phase}`);
    case 6:
      return svgToImg(moon06, { [color]: true }, `moon ${phase}`);
    case 7:
      return svgToImg(moon07, { [color]: true }, `moon ${phase}`);
    case 8:
      return svgToImg(moon08, { [color]: true }, `moon ${phase}`);
    case 9:
      return svgToImg(moon09, { [color]: true }, `moon ${phase}`);
    case 10:
      return svgToImg(moon10, { [color]: true }, `moon ${phase}`);
    case 11:
      return svgToImg(moon11, { [color]: true }, `moon ${phase}`);
    case 12:
      return svgToImg(moon12, { [color]: true }, `moon ${phase}`);
    case 13:
      return svgToImg(moon13, { [color]: true }, `moon ${phase}`);

    default:
      Log.error("moonIcons", "unkown moon phase", phase);
      return "";
  }
}

function svgToImg(
  svg: string,
  css: { [className: string]: boolean },
  alt: string
): ReactNode {
  return (
    <img
      src={svg}
      className={cssClass({
        "svg-img": true,
        ...css,
      })}
      alt={alt}
    />
  );
}
