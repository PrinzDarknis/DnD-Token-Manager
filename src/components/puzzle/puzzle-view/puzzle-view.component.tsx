import { Component, ReactNode } from "react";

import "./puzzle-view.css";

import { Owlbear } from "../../../owlbear";
import { PuzzleInfo } from "../../../model";
import { Log } from "../../../utils";

import { CubeDevice, CubeDevicePuzzleInfo } from "../cube-device";
import { T9, T9PuzzleInfo } from "../t9";

interface Props {
  gm: boolean;
}
interface State {
  puzzle?: PuzzleInfo;
}

export class PuzzleView extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  // Listeners
  protected unSubscribeActionListener?: () => void;
  async componentDidMount(): Promise<void> {
    this.unSubscribeActionListener = await Owlbear.puzzle.listenUpdate(
      (puzzle) => this.setPuzzle(puzzle)
    );
    const currentPuzzle = await Owlbear.puzzle.loadCurrentPuzzle();
    if (currentPuzzle) await this.setPuzzle(currentPuzzle);
  }

  componentWillUnmount(): void {
    this.unSubscribeActionListener?.();
  }

  // State
  async setStatePromise(state: State): Promise<void> {
    return new Promise<void>((resolve) => this.setState(state, resolve));
  }

  protected get puzzle(): PuzzleInfo | undefined {
    return this.state.puzzle;
  }
  private async setPuzzle(puzzle: PuzzleInfo): Promise<void> {
    await this.setStatePromise({ ...this.state, puzzle });
  }

  // handler
  async onStateUpdate(
    newPuzzleState: unknown,
    processing: boolean
  ): Promise<void> {
    if (!this.puzzle) {
      Log.error("PuzzleView", "got Update, but puzzle is not defined", {
        puzzle: this.puzzle,
        newPuzzleState,
        processing,
      });
      return;
    }

    const update: PuzzleInfo = {
      ...this.puzzle,
      state: newPuzzleState,
      processing,
    };
    await Owlbear.puzzle.sendUpdate(update);
    Owlbear.puzzle.saveCurrentPuzzle(update);
  }

  // render
  render(): ReactNode {
    return (
      <>
        <div className="puzzle-view">
          {!this.puzzle ? (
            <div className="no-puzzle">{"No Puzzle is loaded <3"}</div>
          ) : (
            this.renderPuzzle(this.puzzle.puzzle)
          )}
        </div>
      </>
    );
  }

  renderPuzzle(puzzleName: string): ReactNode {
    switch (puzzleName) {
      case "Cube Device":
        return (
          <CubeDevice
            gm={this.props.gm}
            mode="view"
            onStateUpdate={(...args) => this.onStateUpdate(...args)}
            puzzleInfo={this.puzzle as CubeDevicePuzzleInfo}
          />
        );
      case "T9":
        return (
          <T9
            gm={this.props.gm}
            mode="view"
            onStateUpdate={(...args) => this.onStateUpdate(...args)}
            puzzleInfo={this.puzzle as T9PuzzleInfo}
          />
        );

      default:
        Log.error("PuzzleView", "try to load unkown Puzzle", this.puzzle);
        return "unkown Puzzle";
    }
  }
}
