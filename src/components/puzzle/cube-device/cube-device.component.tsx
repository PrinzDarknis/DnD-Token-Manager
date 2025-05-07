import { ReactNode } from "react";

import "./cube-device.css";
import magicHandImg from "/icons/misc/magic-hand.svg";

import { cssClass, Log, mod } from "../../../utils";
import { PuzzleInfo } from "../../../model";

import { AbstractPuzzle } from "../../abstract";
import { ImgButton, spaceEvenly } from "../../ui";

interface PuzzleConfig {
  nrOfCubes: number;
  symbols: string[];
  startPositions: number[];
}
interface PuzzleState {
  positions: number[];
}
interface PuzzleActions {
  activate: { cubeNr: number };
}
type AdditionalState = object;

export type CubeDevicePuzzleInfo = PuzzleInfo<PuzzleConfig, PuzzleState> & {
  puzzle: "Cube Device";
};

export class CubeDevice extends AbstractPuzzle<
  PuzzleConfig,
  PuzzleState,
  PuzzleActions,
  AdditionalState
> {
  readonly puzzleName: string = "Cube Device";
  readonly actionTime: number = 500;

  getDefaultAdditionalState(): AdditionalState {
    return {};
  }

  async executeAction<Action extends keyof PuzzleActions>(
    action: Action,
    actionData: PuzzleActions[Action]
  ): Promise<PuzzleState> {
    switch (action) {
      case "activate":
        this.puzzleState.positions[actionData.cubeNr] =
          (this.puzzleState.positions[actionData.cubeNr] + 1) %
          this.puzzleConfig.symbols.length;
        return this.puzzleState;

      default:
        Log.warn("CubeDevice", "Unkown Action", { action, actionData });
        return this.puzzleState;
    }
  }

  renderView(): ReactNode {
    const cubes: ReactNode[] = [];

    for (let cubeIdx = 0; cubeIdx < this.puzzleConfig.nrOfCubes; cubeIdx++) {
      cubes.push(
        <div key={`cube-device-area-${cubeIdx}`} className="cube-area">
          <div className="cube-container">
            <div className="cube">
              {this.puzzleConfig.symbols.map((symbol, symbolIdx) => (
                <div
                  key={`cube-symbole-${symbolIdx}`}
                  className={cssClass({
                    "cube-symbole": true,
                    left: this.checkSymbolIdx(cubeIdx, symbolIdx, -1),
                    center: this.checkSymbolIdx(cubeIdx, symbolIdx, 0),
                    rigth: this.checkSymbolIdx(cubeIdx, symbolIdx, 1),
                  })}
                >
                  {symbol}
                </div>
              ))}
            </div>
          </div>
          <div
            className={cssClass({
              "cube-action-container": true,
              disabled: this.processing,
            })}
          >
            <ImgButton
              img={magicHandImg}
              alt="activate"
              onClick={() => this.sendAction("activate", { cubeNr: cubeIdx })}
              disabled={this.processing}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="cube-device">
        {spaceEvenly(
          cubes,
          this.puzzleConfig.nrOfCubes > 3 ? 2 : 1,
          "cube-device-view"
        )}
      </div>
    );
  }

  // Edit
  async onSave(): Promise<PuzzleInfo<PuzzleConfig, PuzzleState> | undefined> {
    return this.props.puzzleInfo;
  }

  renderEdit(): ReactNode {
    return <div className="cube-device"></div>;
  }

  // Helper
  private checkSymbolIdx(
    cubeIdx: number,
    symbolIdx: number,
    expectedOffset: number
  ): boolean {
    const expectedIdx = mod(
      this.puzzleState.positions[cubeIdx] + expectedOffset,
      this.puzzleConfig.symbols.length
    );
    return symbolIdx == expectedIdx;
  }
}
