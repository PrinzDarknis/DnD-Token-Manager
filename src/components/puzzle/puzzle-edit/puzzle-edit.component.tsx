import { Component, ReactNode } from "react";

import "./puzzle-edit.css";

import { Owlbear } from "../../../owlbear";

import { spaceEvenly } from "../../ui";

import { CUBE_DEVICE_EXAMPLE } from "../cube-device";
import { T9_EXAMPLE } from "../t9";

type Props = object;
type State = object;

export class PuzzleEdit extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  async componentDidMount(): Promise<void> {}

  // State
  async setStatePromise(state: State): Promise<void> {
    return new Promise<void>((resolve) => this.setState(state, resolve));
  }

  // handler
  async onSomeThing(): Promise<void> {}

  // render
  render(): ReactNode {
    const buttons: ReactNode[] = [
      <button
        key={"puzzle-edit-button-cube-device"}
        onClick={() => Owlbear.puzzle.sendUpdate(CUBE_DEVICE_EXAMPLE)}
      >
        Cube Device
      </button>,
      <button
        key={"puzzle-edit-button-t9"}
        onClick={() => Owlbear.puzzle.sendUpdate(T9_EXAMPLE)}
      >
        T9
      </button>,
    ];

    return (
      <>
        <div className="puzzle-edit">
          {spaceEvenly(
            buttons,
            Math.ceil(buttons.length % 3),
            "puzzle-edit-buttons"
          )}
        </div>
      </>
    );
  }
}
