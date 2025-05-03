import { ReactNode } from "react";

import "./cube-device.css";

import { AbstractPuzzle } from "../../abstract";
import { Log } from "../../../utils";

/* eslint-disable @typescript-eslint/no-empty-object-type */
interface PuzzleConfig {}
interface PuzzleState {}
interface PuzzleActions {
  activate: { nr: number };
}
type AdditionalState = object;

export class CubeDevice extends AbstractPuzzle<
  PuzzleConfig,
  PuzzleState,
  PuzzleActions,
  AdditionalState
> {
  readonly name: string = "Cube Device";
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
        // TODO process Action
        return this.puzzleState;

      default:
        Log.warn("CubeDevice", "Unkown Action", { action, actionData });
        return this.puzzleState;
    }
  }

  renderView(): ReactNode {
    return <></>;
  }

  renderEdit(): ReactNode {
    return <></>;
  }
}
