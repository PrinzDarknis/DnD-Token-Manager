import { ICharacter } from "../character";
import { PuzzleInfo } from "../puzzle";
import { GlobalSettings } from "../settings";

import { TimeInfo } from "./time-info.interface";

export interface Backup {
  type: "Backup" | "Import";
  date: number;
  settings: GlobalSettings;
  character: ICharacter[];
  timeInfo: TimeInfo;
  puzzle: { current: PuzzleInfo | undefined; list: PuzzleInfo[] };
}
