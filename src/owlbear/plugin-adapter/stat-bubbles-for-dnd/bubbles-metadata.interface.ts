import { METADATA_SYNC } from "../../constants";

export interface BubblesMetadata {
  "armor class"?: number;
  health?: number;
  "max health"?: number;
  "temporary health"?: number;
  [METADATA_SYNC]?: string | Date;
}
