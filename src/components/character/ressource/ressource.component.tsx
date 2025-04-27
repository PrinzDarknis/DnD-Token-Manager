import { ReactNode, useRef } from "react";

import "./ressource.css";
import plusImg from "/icons/plus.svg";
import minusImg from "/icons/minus.svg";
import shortRestImg from "/icons/short-rest.svg";
import loangRestImg from "/icons/long-rest.svg";

import { IRessource } from "../../../model";
import { mathLimit } from "../../../utils";
import { ImgButton } from "../../ui";

export function RessourceComponent({
  name,
  ressource,
  edit,
  deleteable = false,
  onUpdate,
  onDelete,
}: {
  name: string;
  ressource: IRessource;
  edit: boolean;
  deleteable?: boolean;
  onUpdate?: (data: IRessource) => void;
  onDelete?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function updateUsed(e: React.FormEvent): void {
    const checkbox = e.target as HTMLInputElement;
    const add = checkbox.checked;
    ressource.used = add ? ressource.used + 1 : ressource.used - 1;
    ressource.used = mathLimit(ressource.used, 0, ressource.available); // enforce limits
    onUpdate?.(ressource);
    e.stopPropagation();
  }

  function modAvailable(modifier: number): void {
    const newValue = ressource.available + modifier;

    // Check
    if (newValue < 0) {
      if (deleteable && edit && confirm(`Delete ${name}?`)) {
        onDelete?.();
      }
      return;
    } else if (newValue > 9) {
      return;
    }

    // Update
    ressource.available = newValue;
    if (ressource.used > ressource.available)
      ressource.used = ressource.available;
    onUpdate?.(ressource);
  }

  function changeRestMode(): void {
    ressource.shortReset = !ressource.shortReset;
    onUpdate?.(ressource);
  }

  const nameKey = name.replace(/\s/g, "-");
  const checkboxes: ReactNode[] = [];
  for (let idx = 0; idx < ressource.available; idx++) {
    checkboxes.push(
      <input
        className="ressource-slot"
        type="checkbox"
        key={`ressource-slot-${nameKey}-${idx}-${Math.random()}`} // Rand to force update Checkbox, otherwise checked is updated but Checkbox doesn't react
        data-idx={idx}
        checked={idx < ressource.used}
        onChange={updateUsed}
        onInput={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <div ref={ref} className="ressource">
      <span className="ressource-name">{name}</span>
      <span className="ressource-slots">{checkboxes}</span>
      <ImgButton
        key="ressource-rest"
        img={ressource.shortReset ? shortRestImg : loangRestImg}
        alt={ressource.shortReset ? "Short Rest" : "Long Rest"}
        onClick={() => changeRestMode()}
        disabled={!edit}
      />
      {edit && [
        <ImgButton
          key="ressource-sub"
          img={minusImg}
          alt="-"
          onClick={() => modAvailable(-1)}
        />,
        <ImgButton
          key="ressource-add"
          img={plusImg}
          alt="+"
          onClick={() => modAvailable(1)}
        />,
      ]}
    </div>
  );
}
