import { Component, ReactNode } from "react";

import "./abstract-puzzle.css";

import editImg from "/icons/edit.svg";
import saveImg from "/icons/save.svg";
import failedImg from "/icons/failed.svg";

import { PuzzleInfo } from "../../../model";

import { ImgButton } from "../../ui";
import { Owlbear } from "../../../owlbear";
import { Log } from "../../../utils";

interface Props<PuzzleConfig, PuzzleState> {
  mode: "view" | "edit";
  gm: boolean;
  puzzleInfo: PuzzleInfo<PuzzleConfig, PuzzleState>;
  onStateUpdate: (
    newPuzzleState: PuzzleState,
    processing: boolean
  ) => void | Promise<void>;
  onEditUpdate?: (
    puzzle: PuzzleInfo<PuzzleConfig, PuzzleState>
  ) => void | Promise<void>;
  onSave?: (
    puzzle: PuzzleInfo<PuzzleConfig, PuzzleState>
  ) => void | Promise<void>;
  onCancle?: () => void | Promise<void>;
}
interface State {
  viewEdit: boolean;
}

export abstract class AbstractPuzzle<
  PuzzleConfig,
  PuzzleState,
  PuzzleActions,
  AdditionalState
> extends Component<Props<PuzzleConfig, PuzzleState>, State & AdditionalState> {
  abstract readonly puzzleName: string;
  abstract readonly actionTime: number;

  abstract getDefaultAdditionalState(): AdditionalState;
  abstract executeAction<Action extends keyof PuzzleActions>(
    action: Action,
    actionData: PuzzleActions[Action]
  ): Promise<PuzzleState>;
  abstract renderView(): ReactNode;
  abstract renderEdit(): ReactNode;

  constructor(props: Props<PuzzleConfig, PuzzleState>) {
    super(props);
    this.state = {
      viewEdit: false,
      ...this.getDefaultAdditionalState(),
    };
  }

  // Listeners
  private unSubscribeActionListener?: () => void;
  async componentDidMount<Action extends keyof PuzzleActions>(): Promise<void> {
    this.unSubscribeActionListener = await Owlbear.puzzle.listenAction(
      (action: string, actionData: unknown) =>
        this.gotAction(action as Action, actionData as PuzzleActions[Action])
    );
  }

  componentWillUnmount(): void {
    this.unSubscribeActionListener?.();
  }

  // State
  protected async setStatePromise(
    state: State & AdditionalState
  ): Promise<void> {
    return new Promise<void>((resolve) => this.setState(state, resolve));
  }

  protected get viewEdit(): boolean {
    return this.state.viewEdit;
  }
  private async setViewEdit(viewEdit: boolean): Promise<void> {
    await this.setStatePromise({ ...this.state, viewEdit });
  }

  // Props
  protected get puzzleState(): PuzzleState {
    return this.props.puzzleInfo.state;
  }
  protected get puzzleConfig(): PuzzleConfig {
    return this.props.puzzleInfo.config;
  }
  protected get processing(): boolean {
    return this.props.puzzleInfo.processing;
  }

  // puzzle
  protected async sendAction<Action extends keyof PuzzleActions>(
    action: Action,
    actionData: PuzzleActions[Action]
  ): Promise<void> {
    Owlbear.puzzle.sendAction(
      action as string,
      actionData,
      this.props.puzzleInfo.master
    );
  }

  private masterProcessing: boolean = false;
  private async gotAction<Action extends keyof PuzzleActions>(
    action: Action,
    actionData: PuzzleActions[Action]
  ): Promise<void> {
    if (this.masterProcessing) return;
    this.masterProcessing = true;

    const newPuzzleState = await this.executeAction(action, actionData);
    await this.props.onStateUpdate(newPuzzleState, true);

    setTimeout(async () => {
      await this.props.onStateUpdate(newPuzzleState, false);
      this.masterProcessing = false;
    }, this.actionTime);
  }

  private async save(): Promise<void> {
    await this.props.onSave?.(this.props.puzzleInfo);
  }

  private async cancle(): Promise<void> {
    await this.props.onCancle?.();
  }

  protected async notifyEditPuzzleUpdate(): Promise<void> {
    await this.props.onEditUpdate?.(this.props.puzzleInfo);
  }

  // render
  render(): ReactNode {
    if (this.props.puzzleInfo.puzzle != this.puzzleName) {
      Log.warn(
        this.constructor.name,
        `Puzzle State compatible with component. Component: ${this.puzzleName}, State for: ${this.props.puzzleInfo.puzzle}`,
        this.props.puzzleInfo
      );
      return;
    }

    const view = this.props.mode == "view";
    const actions: ReactNode[] = view
      ? [
          <ImgButton
            key={`puzzle-actions-edit`}
            img={editImg}
            alt="Edit"
            onClick={() => this.setViewEdit(!this.viewEdit)}
            active={this.viewEdit}
          />,
        ]
      : [
          <ImgButton
            key={`puzzle-actions-save`}
            img={saveImg}
            alt="Save"
            onClick={() => this.save()}
            active={this.viewEdit}
          />,
          <ImgButton
            key={`puzzle-actions-cancle`}
            img={failedImg}
            alt="Cancle"
            onClick={() => this.cancle()}
            active={this.viewEdit}
          />,
        ];

    return (
      <>
        <div className="abstract-puzzle">
          <div className="puzzle-header">
            <span className="puzzle-name">
              {this.props.puzzleInfo.visableName}
            </span>
            {this.props.gm && <span className="puzzle-actions">{actions}</span>}
          </div>
          <div className="puzzle-area">
            {view ? this.renderView() : this.renderEdit()}
          </div>
        </div>
      </>
    );
  }
}
