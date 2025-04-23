import { Component, ReactNode } from "react";
import "./character-manager.css";

import { Owlbear } from "../../owlbear";

import { CharacterComponent } from "./character.component";
import { Character } from "./model";

type Props = object;
interface State {
  chars: {
    [id: string]: Character;
  };
  selected: string;
  gm: boolean;
}

export class CharacterManager extends Component<Props, State> {
  protected reset: (() => void) | undefined = undefined;

  constructor(props: Props) {
    super(props);
    this.state = {
      chars: {},
      selected: "",
      gm: false,
    };
  }

  componentDidMount(): void {
    Owlbear.isGM().then((isGM) => this.setGM(isGM));
    Owlbear.character.loadAll().then(async (chars) => {
      await this.setChars(chars);
      await this.setSelected();
      this.reset?.();
    });
    Owlbear.character.registerOnUpdate(
      // onUpdate
      async (char) => {
        // check if updated needed
        const oldChar = this.chars[char.id];
        if (oldChar && oldChar.lastUpdate >= char.lastUpdate) {
          return;
        }

        // update
        await this.setChar(char);
        this.reset?.();
      },
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

  protected gmBackup: boolean = false; // No Clue why state sometime doesn't work
  get gm(): boolean {
    return this.state.gm || this.gmBackup;
  }
  protected async setGM(gm: boolean): Promise<void> {
    await this.setStatePromise({ ...this.state, gm });
    this.gmBackup = gm;
  }

  // Handler
  protected changeSelection(id: string): void {
    this.setSelected(id);
    this.reset?.();
    Owlbear.character.selectedIdTemp = id; // TODO delete
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
            {this.gm && (
              <button
                className="character-selector-button"
                type="button"
                onClick={() => this.addNewChar()}
              >
                +
              </button>
            )}
          </div>
          {this.chars[this.selected] && (
            <CharacterComponent
              gm={this.gm}
              character={this.chars[this.selected]}
              onUpdate={(char) => this.updateChar(char)}
              onDelete={() => this.deleteChar()}
              registerReset={(r) => (this.reset = r)}
            />
          )}
        </div>
      </>
    );
  }
}
