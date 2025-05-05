import { Component, ReactNode } from "react";

import "./puzzle-edit.css";

import { Owlbear } from "../../../owlbear";

import { CubeDevicePuzzleInfo } from "../cube-device";

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
    const data: CubeDevicePuzzleInfo = {
      master: "XXX",
      processing: false,
      puzzle: "Cube Device",
      saveName: "Temp",
      visableName: "Test Puzzle",
      config: {
        nrOfCubes: 3,
        startPositions: [0, 1, 2],
        symbols: ["A", "B", "C", "D"],
      },
      state: { positions: [0, 1, 2] },
    };

    return (
      <>
        <div className="puzzle-edit">
          <button onClick={() => Owlbear.puzzle.sendUpdate(data)}>Set</button>
        </div>
      </>
    );
  }
}
