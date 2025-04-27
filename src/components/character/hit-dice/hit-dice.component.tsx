import { Component, ReactNode } from "react";

import "./hit-dice.css";
import checkImg from "/icons/check.svg";
import settingsImg from "/icons/settings.svg";

import { Character, DiceType, DiceTypeArray } from "../../../model";
import { diceImg, mathLimit } from "../../../utils";
import { ImgButton, spaceEvenly } from "../../ui";

interface Props {
  character: Character;
  edit: boolean;
  onUpdate: (char: Character) => void;
}
interface State {
  mode: Mode;
  editCache: EditChache;
}
type Mode = "view" | "edit";
interface EditChache {
  max: number;
  type: DiceType;
}

export class HitDice extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      mode: "view",
      editCache: {
        max: 1,
        type: "D8",
      },
    };
  }

  async componentDidMount(): Promise<void> {}

  // State
  async setStatePromise(state: State): Promise<void> {
    return new Promise<void>((resolve) => this.setState(state, resolve));
  }

  get mode(): Mode {
    return this.state.mode;
  }
  async setMode(mode: Mode): Promise<void> {
    await this.setStatePromise({ ...this.state, mode });
  }

  get editCache(): EditChache {
    return this.state.editCache;
  }
  async setEditCacheMax(max: number): Promise<void> {
    await this.setStatePromise({
      ...this.state,
      editCache: { ...this.state.editCache, max },
    });
  }
  async setEditCacheType(type: DiceType): Promise<void> {
    await this.setStatePromise({
      ...this.state,
      editCache: { ...this.state.editCache, type },
    });
  }

  // handler
  async clickDice(idx: number): Promise<void> {
    console.debug("Click Dice", idx, this.props.character.hitDiceRemaining);
    let newValue =
      idx < this.props.character.hitDiceRemaining
        ? this.props.character.hitDiceRemaining - 1
        : this.props.character.hitDiceRemaining + 1;
    newValue = mathLimit(newValue, 0, this.props.character.hitDiceMax);

    this.props.character.setValue("hitDiceRemaining", newValue);
    this.props.onUpdate(this.props.character);
  }

  async submitEdit(): Promise<void> {
    if (!this.props.edit) return;

    this.props.character.setValue("hitDiceMax", this.editCache.max);
    this.props.character.setValue("hitDice", this.editCache.type);
    this.props.onUpdate(this.props.character);
    await this.setMode("view");
  }

  async openEdit(): Promise<void> {
    if (!this.props.edit) return;

    await this.setEditCacheMax(this.props.character.hitDiceMax);
    await this.setEditCacheType(this.props.character.hitDice);
    await this.setMode("edit");
  }

  // render
  render(): ReactNode {
    if (this.mode == "view")
      return (
        <>
          <div className="hit-dice-component">
            <div className="hit-dice-view">
              <span className="hit-dices">
                {spaceEvenly(
                  this.renderDice(
                    this.props.character.hitDice,
                    this.props.character.hitDiceMax,
                    this.props.character.hitDiceRemaining
                  ),
                  this.props.character.hitDiceMax > 10 ? 2 : 1
                )}
              </span>
              {this.props.edit && (
                <ImgButton
                  img={settingsImg}
                  alt="edit"
                  onClick={() => this.openEdit()}
                />
              )}
            </div>
          </div>
        </>
      );
    if (this.mode == "edit")
      return (
        <>
          <div className="hit-dice-component">
            <div className="hit-dice-edit">
              <span className="spacer"></span>
              <input
                type="number"
                className="hit-dice-number-edit"
                value={this.editCache.max}
                onChange={(e) => this.setEditCacheMax(Number(e.target.value))}
                onInput={(e) => e.stopPropagation()}
                min={1}
                max={20}
              />
              <select
                name="hit-dice-type-select"
                id="hit-dice-type-select"
                className="hit-dice-type-select"
                value={this.editCache.type}
                onChange={(e) =>
                  this.setEditCacheType(e.target.value as DiceType)
                }
                onInput={(e) => e.stopPropagation()}
              >
                {DiceTypeArray.map((dice) => (
                  <option
                    value={dice}
                    key={`hit-dice-type-select-option-${dice}`}
                  >
                    {dice}
                  </option>
                ))}
              </select>
              <ImgButton
                img={checkImg}
                alt="submit edit"
                onClick={() => this.submitEdit()}
              />
              <span className="spacer"></span>
            </div>
          </div>
        </>
      );
  }

  renderDice(dice: DiceType, max: number, remaining: number): ReactNode[] {
    const diceElements: ReactNode[] = [];
    for (let idx = 0; idx < max; idx++) {
      diceElements.push(
        <ImgButton
          key={`hit-dice-button-${idx}`}
          img={diceImg(dice)}
          alt={`Hit Dice ${dice}`}
          onClick={() => this.clickDice(idx)}
          active={idx < remaining}
          noHover
        />
      );
    }
    return diceElements;
  }
}
