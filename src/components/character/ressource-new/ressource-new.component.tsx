import { useRef } from "react";

import "./ressource-new.css";

import { IRessource } from "../../../model";

export interface INewRessource {
  name: string;
  resource: IRessource;
}

export function NewRessourceComponent({
  onCreate,
}: {
  onCreate?: (data: INewRessource) => void;
}) {
  const refName = useRef<HTMLInputElement>(null);
  const refAvailable = useRef<HTMLInputElement>(null);

  function skipEvent(e: React.FormEvent) {
    e.stopPropagation();
  }

  function onAdd(e?: React.FormEvent): boolean {
    e?.stopPropagation();
    e?.preventDefault();

    if (!refName.current?.checkValidity()) return false;
    if (!refName.current?.value) return false;
    if (!refAvailable.current?.checkValidity()) return false;
    if (!refAvailable.current?.value) return false;

    onCreate?.({
      name: refName.current.value,
      resource: {
        available: Number(refAvailable.current.value),
        used: 0,
        shortReset: false,
      },
    });

    refName.current.value = refName.current.defaultValue;
    refAvailable.current.value = refAvailable.current.defaultValue;
    return false;
  }

  return (
    <div className="new-ressource-component">
      <form
        className="new-ressource"
        onInput={skipEvent}
        onSubmit={(e) => onAdd(e)}
      >
        <input
          ref={refName}
          className="new-ressource-name"
          type="text"
          defaultValue=""
          pattern=".*\S+.*"
          minLength={3}
          maxLength={15}
          onInput={skipEvent}
        />
        <input
          ref={refAvailable}
          className="new-ressource-available"
          type="number"
          defaultValue="1"
          min={1}
          max={9}
          onInput={skipEvent}
        />
        <button
          type="submit"
          className="new-ressource-add"
          onClick={() => onAdd()}
        >
          +
        </button>
      </form>
    </div>
  );
}
