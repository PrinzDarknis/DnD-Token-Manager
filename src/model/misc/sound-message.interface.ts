/** Payload of the sound broadcast: which sound (and which variant) to play. */
export interface SoundMessage {
  /** `Sound.name`, the key into the sound catalog */
  name: string;
  /** index into `Sound.file` if it has several variants; missing → first file */
  index?: number;
}
