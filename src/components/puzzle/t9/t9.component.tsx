import { ReactNode } from "react";

import "./t9.css";
import upImg from "/icons/up.svg";
import downImg from "/icons/down.svg";

import { cssClass, Log } from "../../../utils";
import { PlayerInfo, PuzzleInfo } from "../../../model";
import { Owlbear } from "../../../owlbear";

import { AbstractPuzzle } from "../../abstract";
import {
  AutoResizeTextarea,
  ImgButton,
  NumberEdit,
  Select,
  spaceEvenly,
  Tooltip,
  MultiPick,
} from "../../ui";

import { ALPHABET, CODED_ALPHABET } from "../symbols.constant";

import { IT9 } from "./t9.interface";
import { t9Code, t9Decode, t9IsValideCode } from "./t9-decode.service";

interface PuzzleConfig {
  /** 9 Symbols a 3 Letters */
  code: IT9;
}
interface PuzzleState {
  /** 9 Array a Array of Players (ID) who can read the T */
  playerReadable: string[][];
}
interface PuzzleActions {
  addRemovePlayer: { id: string; tIdx: number };
}
interface AdditionalState {
  me?: PlayerInfo;
  party: PlayerInfo[];
  translate: {
    originText: string;
    targetText: string;
    complexDecode: boolean;
  };
  edit?: EditState;
}
interface EditState {
  symbols: string[];
  letters: string[][];
  unsetSymbols: string[];
  unsetLetters: string[];
}

export type T9PuzzleInfo = PuzzleInfo<PuzzleConfig, PuzzleState> & {
  puzzle: "T9";
};

export class T9 extends AbstractPuzzle<
  PuzzleConfig,
  PuzzleState,
  PuzzleActions,
  AdditionalState
> {
  readonly puzzleName: string = "T9";
  readonly actionTime: number = 500;

  // Puzzle
  getDefaultAdditionalState(): AdditionalState {
    return {
      party: [],
      translate: { originText: "", targetText: "", complexDecode: false },
    };
  }

  // Listeners
  protected unSubscribePartyListener?: () => void;
  async componentDidMount(): Promise<void> {
    await super.componentDidMount();
    await this.setParty(await Owlbear.player.getParty());
    await this.setMe(await Owlbear.player.getMe());
    this.unSubscribePartyListener = await Owlbear.player.onPartyUpdate(
      (party) => this.setParty(party)
    );
  }

  componentWillUnmount(): void {
    super.componentWillUnmount();
    this.unSubscribePartyListener?.();
  }

  // AdditionalState
  get me(): PlayerInfo | undefined {
    return this.state.me;
  }
  async setMe(me: PlayerInfo): Promise<void> {
    await this.setStatePromise({ ...this.state, me });
  }

  get party(): PlayerInfo[] {
    return this.state.party;
  }
  async setParty(party: PlayerInfo[]): Promise<void> {
    await this.setStatePromise({ ...this.state, party });
  }

  get originText(): string {
    return this.state.translate.originText;
  }
  async setOriginText(originText: string): Promise<void> {
    await this.setStatePromise({
      ...this.state,
      translate: { ...this.state.translate, originText },
    });
  }

  get targetText(): string {
    return this.state.translate.targetText;
  }
  async setTargetText(targetText: string): Promise<void> {
    if (!t9IsValideCode(targetText, this.puzzleConfig.code)) {
      Log.warn("T9:setTargetText", "tried to insert invalide code", {
        code: targetText,
      });
      return;
    }

    await this.setStatePromise({
      ...this.state,
      translate: { ...this.state.translate, targetText },
    });
  }

  get complexDecode(): boolean {
    return this.state.translate.complexDecode;
  }
  async setComplexDecode(complexDecode: boolean): Promise<void> {
    await this.setStatePromise({
      ...this.state,
      translate: { ...this.state.translate, complexDecode },
    });
  }

  // Puzzle - View
  async executeAction<Action extends keyof PuzzleActions>(
    action: Action,
    actionData: PuzzleActions[Action]
  ): Promise<PuzzleState> {
    switch (action) {
      case "addRemovePlayer": {
        const tPlayers = this.puzzleState.playerReadable[actionData.tIdx];
        const playerReadableIdx = tPlayers.indexOf(actionData.id);
        if (playerReadableIdx == -1) tPlayers.push(actionData.id);
        else tPlayers.splice(playerReadableIdx, 1);
        return this.puzzleState;
      }
      default:
        Log.warn("CubeDevice", "Unkown Action", { action, actionData });
        return this.puzzleState;
    }
  }

  private codedLetter(letter: string, tIdx: number): string {
    if (this.me && this.puzzleState.playerReadable[tIdx].includes(this.me.id))
      return letter;

    // code Letter
    const letterIdx = ALPHABET.indexOf(letter);
    if (letterIdx == -1) {
      Log.error("T9:codedLetter", "unkown Letter", letter);
      return "❌";
    }

    const codedLetter = CODED_ALPHABET[letterIdx];
    if (!codedLetter) {
      Log.error("T9:codedLetter", "couln't locate Letter in CODED_ALPHABET", {
        letter,
        letterIdx,
        CODED_ALPHABET,
      });
      return "❌";
    }

    return codedLetter;
  }

  renderView(): ReactNode {
    const ts: ReactNode[] = [];
    const t9Entries = Object.entries(this.puzzleConfig.code);

    for (let tIdx = 0; tIdx < t9Entries.length; tIdx++) {
      const [symbol, letters] = t9Entries[tIdx];
      ts.push(
        <div key={`t9-area-${tIdx}`} className="t9-area">
          <div className="t-container">
            <div className="t">
              <div className="t-symbol">{symbol}</div>
              <div className="t-code">
                {letters.map((letter, letterIdx) => (
                  <div
                    key={`t-code-${tIdx}-letter-${letterIdx}`}
                    className="t-code-letter"
                  >
                    {this.codedLetter(letter, tIdx)}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {this.viewEdit && (
            <div
              className={cssClass({
                "t-action-container": true,
                disabled: this.processing,
              })}
            >
              <div className="action-select-players">
                {this.party.map((player, playerIdx) => (
                  <div
                    style={{ color: player.color, accentColor: player.color }}
                    key={`t9-${tIdx}-action-select-player-${playerIdx}`}
                    className="action-select-player"
                  >
                    <label
                      htmlFor={`t9-${tIdx}-action-select-player-${playerIdx}-checkbox`}
                    >
                      {player.name}
                    </label>
                    <input
                      id={`t9-${tIdx}-action-select-player-${playerIdx}-checkbox`}
                      type="checkbox"
                      checked={this.puzzleState.playerReadable[tIdx].includes(
                        player.id
                      )}
                      onChange={() =>
                        this.sendAction("addRemovePlayer", {
                          id: player.id,
                          tIdx,
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="t9">
        {spaceEvenly(ts, Math.ceil(ts.length / 3), "t9-view")}
        {this.viewEdit && (
          <div className="translate-area">
            <div className="translate-container">
              <div className="translate-container-top">
                <AutoResizeTextarea
                  className="translate-input translate-origin"
                  value={this.originText}
                  onChange={(e) => this.setOriginText(e.target.value)}
                />
              </div>
              <div className="translate-container-middle">
                {spaceEvenly(
                  [
                    <ImgButton
                      key={`t9-reverse-translate`}
                      img={upImg}
                      alt="reverse-translate"
                      onClick={() =>
                        this.setOriginText(
                          t9Decode(
                            this.targetText,
                            this.puzzleConfig.code,
                            this.complexDecode
                          ).join(" \n ")
                        )
                      }
                    />,
                    <Tooltip
                      key={`t9-reverse-translate-complex`}
                      tooltip="Decode all possible Permutations"
                    >
                      <input
                        className="t9-reverse-translate-complex"
                        type="checkbox"
                        checked={this.complexDecode}
                        onChange={(e) =>
                          this.setComplexDecode(e.target.checked)
                        }
                      />
                    </Tooltip>,
                    <ImgButton
                      key={`t9-translate`}
                      img={downImg}
                      alt="translate"
                      onClick={() =>
                        this.setTargetText(
                          t9Code(this.originText, this.puzzleConfig.code)
                        )
                      }
                    />,
                  ],
                  1,
                  "translate-actions"
                )}
              </div>
              <div className="translate-container-bottom">
                <AutoResizeTextarea
                  className="translate-input translate-target"
                  value={this.targetText}
                  onChange={(e) => this.setTargetText(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Puzzle - Edit AdditionalState
  get edit(): EditState | undefined {
    return this.state.edit;
  }

  async notifyEditUpdate(): Promise<void> {
    await this.setState({ ...this.state });
  }

  async loadEdit(): Promise<void> {
    const symbols: string[] = [];
    const letters: string[][] = [];
    let unsetLetters: string[] = ALPHABET;

    for (const [symbol, affiliatLetters] of Object.entries(
      this.puzzleConfig.code
    )) {
      symbols.push(symbol);
      letters.push(affiliatLetters);
      unsetLetters = unsetLetters.filter(
        (letter) => !affiliatLetters.includes(letter)
      );
    }

    const edit: EditState = {
      symbols,
      letters,
      unsetLetters,
      unsetSymbols: CODED_ALPHABET.filter((s) => !symbols.includes(s)),
    };
    await this.setStatePromise({ ...this.state, edit });
  }

  async reconstructPuzzle(): Promise<T9PuzzleInfo> {
    if (!this.edit) {
      Log.error("T9:reconstructPuzzle", "edit is not defined");
      throw new Error("edit is not defined");
    }

    const playerReadable: string[][] = [];
    const code: IT9 = {};

    for (let idx = 0; idx < this.edit.symbols.length; idx++) {
      const symbol = this.edit.symbols[idx];
      const letters = this.edit.letters[idx];
      code[symbol] = letters;
      playerReadable.push([]);
    }

    const puzzle: T9PuzzleInfo = {
      puzzle: "T9",
      master: this.props.puzzleInfo.master,
      saveName: this.props.puzzleInfo.saveName,
      visableName: this.props.puzzleInfo.visableName,
      processing: false,
      config: {
        code,
      },
      state: { playerReadable },
    };

    return puzzle;
  }

  async editSymbolLength(n: number): Promise<void> {
    if (!this.edit) return;

    while (n > this.edit.symbols.length) {
      this.edit.symbols.push(this.edit.unsetSymbols.pop() ?? "");
      this.edit.letters.push([]);
    }
    while (n < this.edit.symbols.length) {
      const deletedSymbol = this.edit.symbols.pop();
      const deletedLetters = this.edit.letters.pop();
      if (deletedSymbol) this.edit.unsetSymbols.unshift(deletedSymbol);
      if (deletedLetters) this.edit.unsetLetters.unshift(...deletedLetters);
    }

    await this.notifyEditUpdate();
  }

  async editSymbolUpdate(symbol: string, idx: number): Promise<void> {
    if (!this.edit) return;
    this.edit.symbols[idx] = symbol;
    await this.notifyEditUpdate();
  }

  async editLettersUpdate(letters: string[], idx: number): Promise<void> {
    if (!this.edit) return;
    this.edit.letters[idx] = letters;

    // update unsetLetters
    let unsetLetters: string[] = ALPHABET;
    for (const affiliatLetters of this.edit.letters) {
      unsetLetters = unsetLetters.filter(
        (letter) => !affiliatLetters.includes(letter)
      );
    }
    this.edit.unsetLetters = unsetLetters;

    await this.notifyEditUpdate();
  }

  // Puzzle - Edit
  async onSave(): Promise<PuzzleInfo<PuzzleConfig, PuzzleState> | undefined> {
    if (!this.edit) return;
    if (this.edit.unsetLetters.length > 0)
      if (
        !confirm(
          `The following letters are not set: ${this.edit?.unsetLetters}`
        )
      )
        return;

    return await this.reconstructPuzzle();
  }

  renderEdit(): ReactNode {
    if (!this.edit) {
      this.loadEdit();
      return <div className="t9">Loading...</div>;
    }

    return (
      <div className="t9">
        <div className="config-area">
          <div className="config-container">
            <div className="inline-edit symbols-number">
              <div className="inline-edit-lable symbols-number-lable">
                Number of Symbols:
              </div>
              <div className="inline-edit-edit symbols-number-edit">
                <NumberEdit
                  value={this.edit.symbols.length}
                  steps={[1]}
                  onChange={(n) => this.editSymbolLength(n)}
                  min={1}
                  max={9}
                />
              </div>
            </div>
            <div className="symbols">
              <div className="multiline-edit">
                <div className="multiline-edit-edit">
                  {spaceEvenly(
                    this.edit.symbols.map((symbol, idx) => (
                      <div key={`symbols-area-${idx}`} className="symbols-area">
                        <div className="select-container">
                          <Select
                            value={symbol}
                            options={[symbol, ...this.edit!.unsetSymbols]}
                            onChange={(s) => this.editSymbolUpdate(s, idx)}
                          />
                        </div>
                        <div className="letters-container">
                          <MultiPick
                            key={`test-${idx}`}
                            value={this.edit!.letters[idx]}
                            options={this.edit!.unsetLetters}
                            // options={[...ALPHABET]}
                            onChange={(l) => this.editLettersUpdate(l, idx)}
                          />
                        </div>
                      </div>
                    )),
                    Math.ceil(this.edit.symbols.length / 3),
                    "symbols-area"
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
