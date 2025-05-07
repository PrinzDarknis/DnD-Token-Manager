import { Component, ReactNode } from "react";

import "./puzzle-edit.css";
import editImg from "/icons/edit.svg";
import upImg from "/icons/up.svg";
import plusImg from "/icons/plus.svg";
import trashImg from "/trash.svg";

import { Owlbear } from "../../../owlbear";
import { PuzzleInfo } from "../../../model";

import { ImgButton, spaceEvenly } from "../../ui";

import { CUBE_DEVICE_EXAMPLE } from "../cube-device";
import { T9_EXAMPLE } from "../t9";
import { renderPuzzle } from "../render-puzzle.service";
import { Log } from "../../../utils";

type Props = object;
interface State {
  editPuzzle?: PuzzleInfo;
  puzzles: PuzzleInfo[];
}

export class PuzzleEdit extends Component<Props, State> {
  readonly DEBUG?: PuzzleInfo;

  constructor(props: Props) {
    super(props);
    this.state = {
      puzzles: [],
    };
  }

  // Listeners
  protected unSubscribeUpdateListener?: () => void;
  async componentDidMount(): Promise<void> {
    if (this.DEBUG) {
      await this.setEditPuzzle(this.DEBUG);
      this.loadPuzzle(this.DEBUG);
    }

    await this.setPuzzles(await Owlbear.puzzle.loadList());
    this.unSubscribeUpdateListener = await Owlbear.puzzle.listenListUpdate(
      (puzzles) => this.setPuzzles(puzzles)
    );
  }

  componentWillUnmount(): void {
    this.unSubscribeUpdateListener?.();
  }

  // State
  async setStatePromise(state: State): Promise<void> {
    return new Promise<void>((resolve) => this.setState(state, resolve));
  }

  get editPuzzle(): PuzzleInfo | undefined {
    return this.state.editPuzzle;
  }
  async setEditPuzzle(editPuzzle: PuzzleInfo | undefined): Promise<void> {
    await this.setStatePromise({ ...this.state, editPuzzle });
  }

  get puzzles(): PuzzleInfo[] {
    return this.state.puzzles;
  }
  async setPuzzles(puzzles: PuzzleInfo[]): Promise<void> {
    await this.setStatePromise({ ...this.state, puzzles });
  }

  // handler
  async loadPuzzle(puzzle: PuzzleInfo): Promise<void> {
    const oldPuzzle = await Owlbear.puzzle.loadCurrentPuzzle();
    puzzle.processing = false;
    await Owlbear.puzzle.saveCurrentPuzzle(puzzle);
    await Owlbear.puzzle.sendUpdate(puzzle);
    if (oldPuzzle) await this.savePuzzle(oldPuzzle);
  }

  async savePuzzle(puzzle: PuzzleInfo): Promise<void> {
    const idx = this.puzzles.findIndex((p) => p.saveName == puzzle.saveName);
    if (idx == -1) this.puzzles.push(puzzle);
    else this.puzzles[idx] = puzzle;

    await Owlbear.puzzle.saveList(this.puzzles);
    await this.setEditPuzzle(undefined);
  }

  async newPuzzle(puzzleType: string, saveName: string): Promise<void> {
    const puzzleWithSameName = this.puzzles.find((p) => p.saveName == saveName);
    if (puzzleWithSameName || !saveName) {
      alert("Save-Name is allready in use.");
      return;
    }

    switch (puzzleType) {
      case "Cube Device":
        await this.setEditPuzzle({ ...CUBE_DEVICE_EXAMPLE, saveName });
        break;
      case "T9":
        await this.setEditPuzzle({ ...T9_EXAMPLE, saveName });
        break;
      default:
        Log.error("PuzzleEdit:newPuzzle", "unkown puzzle type", puzzleType);
        break;
    }
  }

  async deletePuzzle(puzzle: PuzzleInfo): Promise<void> {
    const idx = this.puzzles.findIndex((p) => p.saveName == puzzle.saveName);
    if (idx == -1) {
      Log.error("PuzzleEdit:deletePuzzle", "try to delete an unkown puzzle", {
        puzzle,
        kownPuzzles: this.puzzles,
      });
      return;
    }

    if (
      !confirm(
        `Delete Puzzle: ${puzzle.puzzle} ${puzzle.saveName} - ${puzzle.visableName}`
      )
    )
      return;
    this.puzzles.splice(idx, 1);

    await Owlbear.puzzle.saveList(this.puzzles);
  }

  // render
  render(): ReactNode {
    if (this.editPuzzle) return this.renderEdit();
    return this.renderList();
  }

  renderList(): ReactNode {
    return (
      <>
        <div className="puzzle-edit-list">
          <table className="puzzle-edit-list-table">
            <thead>
              <tr>
                <th className="th-name">Save</th>
                <th className="th-name">Name</th>
                <th className="th-type">Puzzle</th>
                <th className="th-icon">Edit</th>
                <th className="th-icon">Load</th>
                <th className="th-icon">Delete</th>
              </tr>
            </thead>
            <tbody>
              {this.puzzles.map((puzzle, idx) => (
                <tr key={`puzzle-edit-list-table-row-${idx}`}>
                  <td className="table-save-name">{puzzle.saveName}</td>
                  <td className="table-visable-name">{puzzle.visableName}</td>
                  <td className="table-visable-puzzle">{puzzle.puzzle}</td>
                  <td className="table-icon table-edit">
                    <ImgButton
                      img={editImg}
                      alt="edit"
                      onClick={() => this.setEditPuzzle(puzzle)}
                    />
                  </td>
                  <td className="table-icon table-load">
                    <ImgButton
                      img={upImg}
                      alt="load"
                      onClick={() => this.loadPuzzle(puzzle)}
                    />
                  </td>
                  <td className="table-icon table-delete">
                    <ImgButton
                      img={trashImg}
                      alt="delete"
                      onClick={() => this.deletePuzzle(puzzle)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="puzzle-edit-list-new-area">
            <div className="puzzle-edit-list-new-container">
              <form
                onSubmit={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const saveName = formData.get("saveName")?.toString() ?? "";
                  const puzzleType =
                    formData.get("puzzleType")?.toString() ?? "";
                  this.newPuzzle(puzzleType, saveName);
                }}
              >
                {spaceEvenly(
                  [
                    <select
                      key={"puzzle-edit-list-new-puzzletype"}
                      name="puzzleType"
                      id="puzzleType"
                    >
                      <option value="Cube Device">Cube Device</option>
                      <option value="T9">T9</option>
                    </select>,
                    <input
                      key={"puzzle-edit-list-new-savename"}
                      type="text"
                      name="saveName"
                      id="saveName"
                    />,
                    <ImgButton
                      key={"puzzle-edit-list-new-submit"}
                      img={plusImg}
                      alt="Create"
                      type="submit"
                      onClick={() => {}}
                    />,
                  ],
                  1,
                  "puzzle-edit-list-new-form-spacer"
                )}
              </form>
            </div>
          </div>
        </div>
      </>
    );
  }

  renderEdit(): ReactNode {
    return (
      <>
        <div className="puzzle-edit-edit">
          {renderPuzzle(
            this.editPuzzle!,
            "edit",
            (newPuzzleState: unknown) =>
              this.setEditPuzzle({
                ...this.editPuzzle!,
                state: newPuzzleState,
              }),
            true,
            (puzzle: PuzzleInfo) => this.setEditPuzzle(puzzle),
            (puzzle: PuzzleInfo) => this.savePuzzle(puzzle),
            () => this.setEditPuzzle(undefined)
          )}
        </div>
      </>
    );
  }
}
