import "./character.css";

import trash from "/trash.svg";

import { Character } from "./model";
import { RessourceComponent } from "./ressource.component";
import {
  INewRessource,
  NewRessourceComponent,
} from "./ressource-new.component";

export function CharacterComponent({
  character,
  gm,
  onUpdate,
  onDelete,
  registerReset,
}: {
  character: Character;
  gm: boolean;
  onUpdate?: (character: Character) => void;
  onDelete?: () => void;
  registerReset?: (resetFunction: () => void) => void;
}) {
  function onImput(e: React.FormEvent) {
    // get Data
    const input = e.target as HTMLInputElement;
    const property = input.getAttribute("data-property");

    // validate
    if (!property) {
      console.error("Missing data-property on", input);
      throw new Error("data-property was not defined");
    }
    if (!input.checkValidity() || !input.value) {
      console.debug(`invalide input "${input.value}" on`, input);
      return;
    }

    // set Data
    character.setValue(property, input.value.trim());
    onUpdate?.(character);

    e.stopPropagation();
  }

  function updateResource(resourcProperty: string, value: unknown): void {
    character.setValue(resourcProperty, value);
    onUpdate?.(character);
  }

  function deleteOtherResource(name: string): void {
    character.deleteOtherResource(name);
    onUpdate?.(character);
  }

  function newResource(data: INewRessource) {
    updateResource(`otherResources.${data.name}`, data.resource);
  }

  return (
    <>
      <div className="character">
        <form
          ref={(el) => {
            registerReset?.(() => {
              el?.reset();
            });
          }}
          onInput={onImput}
          onSubmit={(e) => {
            e.stopPropagation();
            e.preventDefault();
            return false;
          }}
        >
          <div className="character-information">
            <h1 className="name character-information-item">
              <input
                type="text"
                defaultValue={character.name}
                data-property="name"
                pattern=".*\S+.*"
                maxLength={15}
              />
              {gm && (
                <button
                  type="button"
                  className="character-delete"
                  onClick={() => onDelete?.()}
                >
                  <img
                    src={trash}
                    className="character-delete-icon"
                    alt="Delete CHaracter"
                  />
                </button>
              )}
            </h1>
            <span className="hp character-information-item">
              <input
                type="number"
                defaultValue={character.hp}
                data-property="hp"
                min={0}
              />
              <span className="devider">/</span>
              <input
                type="number"
                defaultValue={character.maxHp}
                data-property="maxHp"
                min={0}
              />
            </span>
            <span className="ac character-information-item">
              <label>
                AC
                <input
                  type="number"
                  defaultValue={character.ac}
                  data-property="ac"
                  min={0}
                />
              </label>
            </span>
          </div>
          <div className="resource-list">
            <h2>Spellslots</h2>
            {Object.entries(character.spellslots).map(
              ([slotNumber, ressource]) => (
                <RessourceComponent
                  key={`spellslots-${slotNumber}`}
                  name={`Level ${slotNumber}`}
                  gm={gm}
                  ressource={ressource}
                  onUpdate={(newRessource) =>
                    updateResource(`spellslots.${slotNumber}`, newRessource)
                  }
                />
              )
            )}

            <h2>Other</h2>
            {Object.entries(character.otherResources).map(
              ([name, ressource]) => (
                <RessourceComponent
                  key={`spellslots-${name}`}
                  name={name}
                  gm={gm}
                  deleteable
                  ressource={ressource}
                  onUpdate={(newRessource) =>
                    updateResource(`otherResources.${name}`, newRessource)
                  }
                  onDelete={() => deleteOtherResource(name)}
                />
              )
            )}
          </div>
        </form>
        <br />
        {gm && <NewRessourceComponent onCreate={(data) => newResource(data)} />}
      </div>
    </>
  );
}
