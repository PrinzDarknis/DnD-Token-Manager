import { Component, ReactNode } from "react";

import "./character.css";

import trash from "/trash.svg";

import {
  Character,
  CharacterStandartProperties,
  CharacterStandartPropertiesComplex,
  IRessource,
} from "../../../model";
import { Log } from "../../../utils";

import { RessourceComponent } from "../ressource";
import { INewRessource, NewRessourceComponent } from "../ressource-new";

interface Props {
  character: Character;
  gm: boolean;
  onUpdate?: (character: Character) => void;
  onDelete?: () => void;
}

export class CharacterComponent extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  protected update(character: Character) {
    this.props.onUpdate?.(character);
  }

  protected onImput(e: React.FormEvent) {
    // get Data
    const input = e.target as HTMLInputElement;
    const property = input.getAttribute(
      "data-property"
    ) as CharacterStandartProperties;

    // validate
    if (!property) {
      Log.error("CharacterComponent", "Missing data-property on", input);
      throw new Error("data-property was not defined");
    }
    if (!input.checkValidity() || !input.value) {
      Log.debug(
        "CharacterComponent",
        `invalide input "${input.value}" on`,
        input
      );
      return;
    }

    // set Data
    this.props.character.setValue(property, input.value.trim());
    this.update(this.props.character);

    e.stopPropagation();
  }

  protected updateResource(
    resourcProperty: CharacterStandartPropertiesComplex,
    value: IRessource
  ): void {
    this.props.character.setValue(resourcProperty, value);
    this.update(this.props.character);
  }

  protected deleteOtherResource(name: string): void {
    this.props.character.deleteOtherResource(name);
    this.update(this.props.character);
  }

  protected newResource(data: INewRessource) {
    this.updateResource(`otherResources.${data.name}`, data.resource);
  }

  render(): ReactNode {
    return (
      <>
        <div className="character">
          <form
            onInput={(e) => this.onImput(e)}
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
                  key={`${this.props.character.id}-name`}
                  defaultValue={this.props.character.name}
                  data-property="name"
                  pattern=".*\S+.*"
                  maxLength={15}
                />
                {this.props.gm && (
                  <button
                    type="button"
                    className="character-delete"
                    onClick={() => this.props.onDelete?.()}
                  >
                    <img
                      src={trash}
                      className="character-delete-icon"
                      alt="Delete CHaracter"
                    />
                  </button>
                )}
              </h1>
              <span className="stats character-information-item">
                <span className="hp round-box">
                  <input
                    ref={(e) => {
                      this.hpInputElement = e;
                    }}
                    type="number"
                    className="input-number-hover-buttons"
                    key={`${this.props.character.id}-hp`}
                    defaultValue={this.props.character.hp}
                    data-property="hp"
                    min={0}
                    max={999}
                  />
                  <span className="devider">/</span>
                  <input
                    ref={(e) => {
                      this.maxHpInputElement = e;
                    }}
                    type="number"
                    className="input-number-hover-buttons"
                    key={`${this.props.character.id}-maxHp`}
                    defaultValue={this.props.character.maxHp}
                    data-property="maxHp"
                    min={0}
                    max={999}
                  />
                  <span className="devider">+</span>
                  <input
                    ref={(e) => {
                      this.maxHpModInputElement = e;
                    }}
                    type="number"
                    className="input-number-hover-buttons"
                    key={`${this.props.character.id}-maxHpMod`}
                    defaultValue={this.props.character.maxHpMod}
                    data-property="maxHpMod"
                    max={999}
                  />
                </span>
                <span className="spacer"></span>
                <span className="ac round-box">
                  <label>
                    AC
                    <input
                      ref={(e) => {
                        this.acInputElement = e;
                      }}
                      type="number"
                      className="input-number-hover-buttons"
                      key={`${this.props.character.id}-ac`}
                      defaultValue={this.props.character.ac}
                      data-property="ac"
                      min={0}
                      max={99}
                    />
                  </label>
                </span>
              </span>
            </div>
            <div className="resource-list">
              <h2>Spellslots</h2>
              {Object.entries(this.props.character.spellslots).map(
                ([slotNumber, ressource]) => (
                  <RessourceComponent
                    key={`spellslots-${slotNumber}`}
                    name={`Level ${slotNumber}`}
                    gm={this.props.gm}
                    ressource={ressource}
                    onUpdate={(newRessource) =>
                      this.updateResource(
                        `spellslots.${slotNumber as "1"}`,
                        newRessource
                      )
                    }
                  />
                )
              )}

              <h2>Other</h2>
              {Object.entries(this.props.character.otherResources).map(
                ([name, ressource]) => (
                  <RessourceComponent
                    key={`spellslots-${name}`}
                    name={name}
                    gm={this.props.gm}
                    deleteable
                    ressource={ressource}
                    onUpdate={(newRessource) =>
                      this.updateResource(
                        `otherResources.${name}`,
                        newRessource
                      )
                    }
                    onDelete={() => this.deleteOtherResource(name)}
                  />
                )
              )}
            </div>
          </form>
          {this.props.gm && (
            <NewRessourceComponent
              onCreate={(data) => this.newResource(data)}
            />
          )}
        </div>
      </>
    );
  }

  hpInputElement: HTMLInputElement | null = null;
  maxHpInputElement: HTMLInputElement | null = null;
  maxHpModInputElement: HTMLInputElement | null = null;
  acInputElement: HTMLInputElement | null = null;
  componentDidUpdate(): void {
    // hp
    if (
      this.hpInputElement &&
      this.hpInputElement.value != `${this.props.character.hp}`
    )
      this.hpInputElement.value = `${this.props.character.hp}`;
    // maxHp
    if (
      this.maxHpInputElement &&
      this.maxHpInputElement.value != `${this.props.character.maxHp}`
    )
      this.maxHpInputElement.value = `${this.props.character.maxHp}`;
    //maxHpMod
    if (
      this.maxHpModInputElement &&
      this.maxHpModInputElement.value != `${this.props.character.maxHpMod}`
    )
      this.maxHpModInputElement.value = `${this.props.character.maxHpMod}`;
    // ac
    if (
      this.acInputElement &&
      this.acInputElement.value != `${this.props.character.ac}`
    )
      this.acInputElement.value = `${this.props.character.ac}`;
  }
}
