import { ReactNode, useRef } from "react";
import "./ressource.css";

import { IRessource } from "./model";

export function RessourceComponent({
  name,
  ressource,
  onUpdate,
}: {
  name: string;
  ressource: IRessource;
  onUpdate?: (data: IRessource) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function updateUsed(e: React.FormEvent): void {
    const checkbox = e.target as HTMLInputElement;
    const add = checkbox.checked;
    ressource.used = add ? ressource.used + 1 : ressource.used - 1;

    onUpdate?.(ressource);
    e.stopPropagation();
  }

  function modAvailable(modifier: number): void {
    ressource.available = ressource.available + modifier;
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
        key={`ressource-slot-${nameKey}-${idx}`}
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
      <button
        type="button"
        className="new-ressource-mod new-ressource-add"
        onClick={() => modAvailable(-1)}
      >
        -
      </button>
      <button
        type="button"
        className="new-ressource-mod new-ressource-sub"
        onClick={() => modAvailable(1)}
      >
        +
      </button>
    </div>
  );
}
