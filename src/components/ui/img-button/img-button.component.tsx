import { ReactNode } from "react";

import "./img-button.css";

import { cssClass } from "../../../utils";

export function ImgButton({
  img,
  alt,
  onClick,
  className = "",
  active = false,
  noHover = false,
}: {
  img: string;
  alt: string;
  active?: boolean;
  noHover?: boolean;
  className?:
    | string
    | {
        [className: string]: boolean;
      };
  onClick: () => void;
}): ReactNode {
  const imgClassName =
    typeof className == "string" ? className : cssClass(className);
  return (
    <button type="button" className="img-button" onClick={() => onClick()}>
      <img
        src={img}
        className={cssClass({
          "img-button-icon": true,
          [imgClassName]: true,
          hoverable: !noHover,
          active: active,
        })}
        alt={alt}
      />
    </button>
  );
}
