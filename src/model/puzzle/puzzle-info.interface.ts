export interface PuzzleInfo<PuzzleConfig = unknown, PuzzleState = unknown> {
  puzzle: string;
  visableName: string;
  saveName: string;
  master: string;
  config: PuzzleConfig;
  state: PuzzleState;
  processing: boolean;
}
