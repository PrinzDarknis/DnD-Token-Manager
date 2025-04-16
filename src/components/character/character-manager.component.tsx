import { Component, ReactNode } from "react";
import "./character-manager.css";

import { Owlbear } from "../../owlbear";

import { CharacterComponent } from "./character.component";
import { Character } from "./model";

type Props = object;
interface State {
  chars: Character[];
  selected: number;
}

export class CharacterManager extends Component<Props, State> {
  protected reset: (() => void) | undefined = undefined;

  constructor(props: Props) {
    super(props);
    this.state = {
      chars: [],
      selected: 0,
    };
  }

  componentDidMount(): void {
    Owlbear.character.load().then((chars) => this.setChars(chars));
    Owlbear.character.registerOnUpdate((chars) => this.setChars(chars));
  }

  // State
  get chars(): Character[] {
    return this.state.chars;
  }
  setChars(chars: Character[]): void {
    this.setState({ ...this.state, chars });
  }

  get selected(): number {
    return this.state.selected;
  }
  protected setSelected(selected: number): void {
    this.setState({ ...this.state, selected });
  }

  // Handler
  protected changeSelection(idx: number): void {
    this.setSelected(idx);
    this.reset?.();
  }

  protected updateChar(char: Character): void {
    this.chars[this.selected] = char;
    const newChars = [...this.chars];
    this.setChars(newChars);
    Owlbear.character.save(newChars);
  }

  protected deleteChar(): void {
    // ask
    if (!confirm("Delete Character")) return;

    // delete
    this.chars.splice(this.selected, 1);
    const newChars = [...this.chars];
    this.setChars(newChars);
    Owlbear.character.save(newChars);
    this.setSelected(0);
  }

  protected addNewChar(): void {
    const newChars = [...this.chars, new Character(this.chars)];
    this.setChars(newChars);
    Owlbear.character.save(newChars);
    this.changeSelection(newChars.length - 1);
  }

  // Render
  render(): ReactNode {
    return (
      <>
        <div className="character-manager">
          <div className="character-selector">
            {this.chars.map((char, idx) => (
              <button
                className="character-selector-button"
                type="button"
                onClick={() => this.changeSelection(idx)}
                disabled={idx == this.selected}
                key={`select-button-${idx}`}
              >
                {char.name}
              </button>
            ))}
            <button
              className="character-selector-button"
              type="button"
              onClick={() => this.addNewChar()}
            >
              +
            </button>
          </div>
          {this.chars[this.selected] && (
            <CharacterComponent
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
