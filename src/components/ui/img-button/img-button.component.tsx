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
  disabled = false,
  type = "button",
}: {
  img: string;
  alt: string;
  active?: boolean;
  noHover?: boolean;
  disabled?: boolean;
  type?: "button" | "reset" | "submit";
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
    <button
      type={type}
      className="img-button"
      onClick={() => onClick()}
      disabled={disabled}
    >
      <img
        src={img}
        className={cssClass({
          "img-button-icon": true,
          [imgClassName]: true,
          hoverable: !noHover && !disabled,
          active: active,
        })}
        alt={alt}
      />
    </button>
  );
}
