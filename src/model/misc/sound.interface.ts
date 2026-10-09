export interface Sound {
  name: string;
  img: string;
  file: string | string[];
  /**
   * Base volume (default 1) to level out loudness differences between the
   * sound files. Multiplied with the player's master volume; the result is
   * limited to 0–1. Values > 1 raise quiet sounds when the master volume
   * leaves headroom.
   */
  volume?: number;
}
