import { ReactNode } from "react";

import { PuzzleInfo } from "../../model";
import { Log } from "../../utils";

import { CubeDevice, CubeDevicePuzzleInfo } from "./cube-device";
import { T9, T9PuzzleInfo } from "./t9";

export function renderPuzzle(
  puzzle: PuzzleInfo,
  mode: "view" | "edit",
  onStateUpdate: (
    newPuzzleState: unknown,
    processing: boolean
  ) => void | Promise<void>,
  gm: boolean,
  onEditUpdate?: (puzzle: PuzzleInfo) => void | Promise<void>,
  onSave?: (puzzle: PuzzleInfo) => void | Promise<void>,
  onCancle?: () => void | Promise<void>
): ReactNode {
  switch (puzzle.puzzle) {
    case "Cube Device":
      return (
        <CubeDevice
          gm={gm}
          mode={mode}
          puzzleInfo={puzzle as CubeDevicePuzzleInfo}
          onStateUpdate={onStateUpdate}
          onEditUpdate={onEditUpdate}
          onSave={onSave}
          onCancle={onCancle}
        />
      );
    case "T9":
      return (
        <T9
          gm={gm}
          mode={mode}
          puzzleInfo={puzzle as T9PuzzleInfo}
          onStateUpdate={onStateUpdate}
          onEditUpdate={onEditUpdate}
          onSave={onSave}
          onCancle={onCancle}
        />
      );

    default:
      Log.error("PuzzleView", "try to load unkown Puzzle", puzzle);
      return "unkown Puzzle";
  }
}
