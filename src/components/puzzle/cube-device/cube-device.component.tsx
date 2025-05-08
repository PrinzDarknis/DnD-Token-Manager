import { ReactNode } from "react";

import "./cube-device.css";
import magicHandImg from "/icons/misc/magic-hand.svg";
import randomImg from "/icons/random.svg";

import { cssClass, fixArrayLength, Log, mod } from "../../../utils";
import { PuzzleInfo } from "../../../model";

import { AbstractPuzzle } from "../../abstract";
import {
  ImgButton,
  MultiPick,
  NumberEdit,
  RadioGroup,
  Select,
  spaceEvenly,
  Tooltip,
} from "../../ui";
import { ALPHABET, SYMBOLS } from "../symbols.constant";

interface PuzzleConfig {
  nrOfCubes: number;
  symbols: string[];
  startPositions: number[];
  links: number[][];
}
interface PuzzleState {
  positions: number[];
}
interface PuzzleActions {
  activate: { cubeNr: number };
}
interface AdditionalState {
  editSymbolCollection: string[];
}

const BOTH_SYMBOL_COLLECTION = [...ALPHABET, ...SYMBOLS];

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
    return {
      editSymbolCollection: SYMBOLS,
    };
  }

  get editSymbolCollection(): string[] {
    return this.state.editSymbolCollection;
  }
  async setEditSymbolCollection(editSymbolCollection: string[]): Promise<void> {
    await this.setStatePromise({ ...this.state, editSymbolCollection });
  }

  // View
  async executeAction<Action extends keyof PuzzleActions>(
    action: Action,
    actionData: PuzzleActions[Action]
  ): Promise<PuzzleState> {
    switch (action) {
      case "activate":
        return this.actionActivate(actionData, this.puzzleState);

      default:
        Log.warn("CubeDevice", "Unkown Action", { action, actionData });
        return this.puzzleState;
    }
  }

  private actionActivate(
    actionData: PuzzleActions["activate"],
    state: PuzzleState
  ): PuzzleState {
    this.puzzleConfig.links[actionData.cubeNr].forEach((linkedCube) => {
      state.positions[linkedCube] =
        (state.positions[linkedCube] + 1) % this.puzzleConfig.symbols.length;
    });
    return state;
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
    // Check
    if (this.puzzleConfig.symbols.length < 3) {
      alert("At least 3 Symbols musst be selected");
      return;
    }

    const cubesLinked: boolean[] = Array(this.puzzleConfig.nrOfCubes).fill(
      false
    );
    for (const cubeLinks of this.puzzleConfig.links) {
      if (cubeLinks.length == 0) {
        alert("All Cubes musst have at lest one linked Cube");
        return;
      }
      cubeLinks.forEach((link) => (cubesLinked[link] = true));
    }

    for (let cubeIdx = 0; cubeIdx < cubesLinked.length; cubeIdx++) {
      if (!cubesLinked[cubeIdx]) {
        alert(`There is no Link to Cube ${cubeIdx + 1}`);
        return;
      }
    }

    this.props.puzzleInfo.state.positions =
      this.props.puzzleInfo.config.startPositions;
    return this.props.puzzleInfo;
  }

  private async editUpdateNrCubes(nr: number): Promise<void> {
    this.puzzleConfig.nrOfCubes = nr;
    fixArrayLength(this.puzzleConfig.startPositions, nr, () => 0);
    fixArrayLength(this.puzzleConfig.links, nr, (idx) => [idx]);
    fixArrayLength(this.puzzleState.positions, nr, () => 0);

    // fix Links
    this.puzzleConfig.links = this.puzzleConfig.links.map((links) =>
      links.filter((cubeIdx) => cubeIdx < nr)
    );

    this.notifyEditPuzzleUpdate();
  }

  private async editUpdateSymbols(symbols: string[]): Promise<void> {
    this.puzzleConfig.symbols = symbols;
    this.notifyEditPuzzleUpdate();
  }

  private async editUpdateStartPosition(
    symbol: string,
    cubeIdx: number
  ): Promise<void> {
    const symbolIdx = this.puzzleConfig.symbols.indexOf(symbol);
    if (symbolIdx < 0) return;

    this.puzzleConfig.startPositions[cubeIdx] = symbolIdx;
    this.notifyEditPuzzleUpdate();
  }

  private async editUpdateLinks(
    linkedCubs: number[],
    cubeIdx: number
  ): Promise<void> {
    this.puzzleConfig.links[cubeIdx] = linkedCubs;
    this.notifyEditPuzzleUpdate();
  }

  private async editRandomizeStartPositions(): Promise<void> {
    let state = this.puzzleState;
    state.positions = Array(this.puzzleConfig.nrOfCubes).fill(0);
    for (let round = 0; round < 20; round++) {
      const activateCube = Math.floor(
        Math.random() * this.puzzleConfig.nrOfCubes
      );
      state = this.actionActivate({ cubeNr: activateCube }, state);
    }
    this.puzzleConfig.startPositions = state.positions;
    this.notifyEditPuzzleUpdate();
  }

  renderEdit(): ReactNode {
    return (
      <div className="cube-device cube-device-edit">
        <div className="edit-container">
          <div className="inline-edit cube-number">
            <div className="inline-edit-lable cube-number-lable">
              Number of Cubes:
            </div>
            <div className="inline-edit-edit cube-number-edit">
              <NumberEdit
                value={this.puzzleConfig.nrOfCubes}
                steps={[1]}
                onChange={(n) => this.editUpdateNrCubes(n)}
                min={1}
                max={9}
              />
            </div>
          </div>
          <div className="inline-edit symbol-type">
            <div className="inline-edit-lable symbol-type-lable">
              Symbol Collection:
            </div>
            <div className="inline-edit-edit symbol-type-edit">
              <RadioGroup<string[]>
                groupName="symbol-type"
                value={this.editSymbolCollection}
                options={[ALPHABET, SYMBOLS, BOTH_SYMBOL_COLLECTION]}
                alias={["Alphabet", "Symbols", "Both"]}
                onChange={(sc) => this.setEditSymbolCollection(sc)}
                optionsPerRow={1}
              />
            </div>
          </div>
          <div className="multiline-edit symbol-select">
            <div className="multiline-edit-lable symbol-select-lable">
              Symbols:
            </div>
            <div className="multiline-edit-edit symbol-select-edit">
              <MultiPick
                value={this.puzzleConfig.symbols}
                options={this.editSymbolCollection}
                onChange={(s) => this.editUpdateSymbols(s)}
                noHover
              />
            </div>
          </div>
          <div className="multiline-edit start-positions">
            <div className="multiline-edit-lable start-positions-lable">
              Start Positions:
              <Tooltip tooltip="Roll random Start Positions">
                <ImgButton
                  img={randomImg}
                  alt="randomize"
                  onClick={() => this.editRandomizeStartPositions()}
                />
              </Tooltip>
            </div>
            <div className="multiline-edit-edit start-positions-edit">
              {spaceEvenly(
                this.puzzleConfig.startPositions.map((position, idx) => (
                  <Select
                    key={`start-positions-${idx}`}
                    value={this.puzzleConfig.symbols[position]}
                    options={this.puzzleConfig.symbols}
                    onChange={(s) => this.editUpdateStartPosition(s, idx)}
                  />
                )),
                Math.ceil(this.puzzleConfig.startPositions.length / 5),
                "start-positions"
              )}
            </div>
          </div>
          <div className="multiline-edit link-select">
            <div className="multiline-edit-lable link-select-lable">
              Linked Cubes:
            </div>
            <div className="multiline-edit-edit link-select-edit">
              {spaceEvenly(
                this.puzzleConfig.links.map((linkedCubes, idx) => (
                  <MultiPick<number>
                    key={`link-select-${idx}`}
                    value={linkedCubes}
                    options={[...Array(this.puzzleConfig.nrOfCubes).keys()]}
                    onChange={(links) => this.editUpdateLinks(links, idx)}
                  />
                )),
                Math.ceil(this.puzzleConfig.startPositions.length / 5),
                "link-select"
              )}
            </div>
          </div>
        </div>
      </div>
    );
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
