import { Component, ReactNode } from "react";

import "./character-selector.css";

import { Owlbear } from "../../../owlbear";
import { Character } from "../../../model";

type Props = object;
interface State {
  chars: Character[];
  selected: string | undefined;
}

export class CharacterSelector extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      chars: [],
      selected: undefined,
    };
  }

  async componentDidMount(): Promise<void> {
    const chars = await Owlbear.character.loadAll();
    await this.setChars(Object.values(chars));
    await Owlbear.character.registerOnUpdate(
      // onUpdate
      undefined,
      // onUpdateAll
      async (chars) => await this.setChars(chars),
      // check delete
      undefined
    );
    const selected = await Owlbear.character.getSelectedTokenCharacterId();
    await this.setSelected(selected);
  }

  // State
  async setStatePromise(state: State): Promise<void> {
    return new Promise<void>((resolve) => this.setState(state, resolve));
  }

  get chars(): Character[] {
    return this.state.chars;
  }
  async setChars(chars: Character[]): Promise<void> {
    await this.setState({ ...this.state, chars });
  }

  get selected(): string | undefined {
    return this.state.selected;
  }
  async setSelected(selected: string | undefined): Promise<void> {
    await this.setState({ ...this.state, selected });
  }

  // handler
  protected async onChange(event: React.ChangeEvent<HTMLSelectElement>) {
    event.stopPropagation();

    const selectedId = event.target.value;
    await Owlbear.character.setSelectedTokenCharacterId(selectedId);
  }

  // render
  render(): ReactNode {
    const randKey = Math.random(); // ensure rerender
    return (
      <>
        <select
          name="character-selector"
          id="character-selector"
          className="character-selector"
          key={randKey}
          defaultValue={this.selected}
          onChange={(e) => this.onChange(e)}
        >
          <option value={undefined}></option>
          {this.chars.map((char) => (
            <option value={char.id} key={`${randKey}-option-${char.id}`}>
              {char.name}
            </option>
          ))}
        </select>
      </>
    );
  }
}
