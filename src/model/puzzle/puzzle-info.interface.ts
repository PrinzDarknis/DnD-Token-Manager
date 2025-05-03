export interface PuzzleInfo<PuzzleConfig = unknown, PuzzleState = unknown> {
  name: string;
  master: string;
  config: PuzzleConfig;
  state: PuzzleState;
  processing: boolean;
}
