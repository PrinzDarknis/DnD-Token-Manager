import { Component, ReactNode } from "react";

import "./character-manager.css";

import editImg from "/icons/edit.svg";

import { Owlbear } from "../../../owlbear";
import { Character } from "../../../model";

import { ImgButton } from "../../ui";

import { CharacterComponent } from "../character";

type Props = object;
interface State {
  chars: {
    [id: string]: Character;
  };
  selected: string;
  gm: boolean;
  edit: boolean;
}

export class CharacterManager extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      chars: {},
      selected: "",
      gm: false,
      edit: false,
    };
  }

  async componentDidMount(): Promise<void> {
    await this.setGM(await Owlbear.isGM());
    const chars = await Owlbear.character.loadAll();
    await this.setChars(chars);
    await this.setSelected();
    await Owlbear.character.registerOnUpdate(
      // onUpdate
      async (char) => {
        // check if updated needed
        const oldChar = this.chars[char.id];
        if (oldChar && oldChar.lastUpdate >= char.lastUpdate) {
          return;
        }

        // update
        await this.setChar(char);
      },
      // onUpdateAll
      undefined,
      // check delete
      async (valideIds) => {
        const invalideCharIds = Object.values(this.chars)
          .filter((char) => !valideIds.includes(char.id))
          .map((char) => char.id);
        const valideChars = { ...this.chars };
        for (const invalideID of invalideCharIds) {
          delete valideChars[invalideID];
        }
        await this.setChars(valideChars);
      }
    );
  }

  // State
  async setStatePromise(state: State): Promise<void> {
    return new Promise<void>((resolve) => this.setState(state, resolve));
  }

  get chars(): {
    [id: string]: Character;
  } {
    return this.state.chars;
  }
  async setChars(chars: { [id: string]: Character }): Promise<void> {
    await this.setStatePromise({ ...this.state, chars });
  }
  async setChar(char: Character): Promise<void> {
    await this.setChars({
      ...this.chars,
      [char.id]: char,
    });
  }

  get selected(): string {
    return this.state.selected;
  }
  protected async setSelected(selected?: string): Promise<void> {
    if (!selected) selected = Object.values(this.chars)[0]?.id ?? "";
    await this.setStatePromise({ ...this.state, selected });
  }

  get gm(): boolean {
    return this.state.gm;
  }
  protected async setGM(gm: boolean): Promise<void> {
    await this.setStatePromise({ ...this.state, gm });
  }

  get edit(): boolean {
    return this.state.edit;
  }
  protected async setEdit(edit: boolean): Promise<void> {
    await this.setStatePromise({ ...this.state, edit });
  }

  // Handler
  protected changeSelection(id: string): void {
    this.setSelected(id);
  }

  protected updateChar(char: Character): void {
    this.setChar(char);
    Owlbear.character.save(char);
  }

  protected async deleteChar(): Promise<void> {
    // ask
    if (!confirm("Delete Character")) return;

    // delete
    const deleteChar = this.chars[this.selected];
    const newChars = { ...this.chars };
    delete newChars[deleteChar.id];
    await this.setChars(newChars);
    Owlbear.character.delete(deleteChar.id);
    await this.setSelected();
  }

  protected addNewChar(): void {
    const newChar = new Character(Object.values(this.chars));
    this.setChar(newChar);
    Owlbear.character.save(newChar);
    this.changeSelection(newChar.id);
  }

  // Render
  render(): ReactNode {
    return (
      <>
        <div className="character-manager">
          <div className="header">
            <div className="character-selector">
              {Object.values(this.chars).map((char) => (
                <button
                  className="character-selector-button"
                  type="button"
                  onClick={() => this.changeSelection(char.id)}
                  disabled={char.id == this.selected}
                  key={`select-button-${char.id}`}
                >
                  {char.name}
                </button>
              ))}
              {this.edit && (
                <button
                  className="character-selector-button"
                  type="button"
                  onClick={() => this.addNewChar()}
                >
                  +
                </button>
              )}
            </div>
            {this.gm && (
              <ImgButton
                img={editImg}
                alt="Edit"
                onClick={() => this.setEdit(!this.edit)}
                active={this.edit}
              />
            )}
          </div>
          {this.chars[this.selected] && (
            <CharacterComponent
              edit={this.edit}
              character={this.chars[this.selected]}
              onUpdate={(char) => this.updateChar(char)}
              onDelete={() => this.deleteChar()}
            />
          )}
        </div>
      </>
    );
  }
}
