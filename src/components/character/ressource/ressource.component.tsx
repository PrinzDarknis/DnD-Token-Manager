import { ReactNode, useRef } from "react";

import "./ressource.css";

import { IRessource } from "../../../model";
import { mathLimit } from "../../../utils";

export function RessourceComponent({
  name,
  ressource,
  gm,
  deleteable = false,
  onUpdate,
  onDelete,
}: {
  name: string;
  ressource: IRessource;
  gm: boolean;
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
      if (deleteable && gm && confirm(`Delete ${name}?`)) {
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
      {gm && (
        <button
          type="button"
          className="new-ressource-mod new-ressource-add"
          onClick={() => modAvailable(-1)}
        >
          -
        </button>
      )}
      {gm && (
        <button
          type="button"
          className="new-ressource-mod new-ressource-sub"
          onClick={() => modAvailable(1)}
        >
          +
        </button>
      )}
    </div>
  );
}
