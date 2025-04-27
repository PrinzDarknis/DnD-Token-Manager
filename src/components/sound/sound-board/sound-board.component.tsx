import { Component, ReactNode } from "react";

import "./sound-board.css";

import { Sound } from "../../../model";

import { ImgButton, spaceEvenly } from "../../ui";

import { Sounds } from "./sound-board.constant";
import { Owlbear } from "../../../owlbear";

type Props = object;
interface State {
  iconsPerLine: number;
}

export class SoundBoard extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      iconsPerLine: 5,
    };
  }

  async componentDidMount(): Promise<void> {}

  // State
  async setStatePromise(state: State): Promise<void> {
    return new Promise<void>((resolve) => this.setState(state, resolve));
  }

  get iconsPerLine(): number {
    return this.state.iconsPerLine;
  }

  // handler
  async playSound(sound: Sound): Promise<void> {
    Owlbear.settings.playSound(sound);
  }

  // render
  render(): ReactNode {
    return (
      <>
        <div className="sound-board">
          <fieldset className="personal-settings settings-area">
            <legend>
              <h2>Sound Board</h2>
            </legend>
            {spaceEvenly(
              Sounds.map((sound) => (
                <ImgButton
                  key={`sound-${sound.name}`}
                  img={sound.img}
                  alt={sound.name}
                  onClick={() => this.playSound(sound)}
                />
              )),
              Math.ceil(Sounds.length / this.iconsPerLine)
            )}
          </fieldset>
        </div>
      </>
    );
  }
}
