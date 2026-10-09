import { mathLimit } from "./math";

/** Returns `value` limited to 0–1, or `fallback` if it is not a finite number. */
export function clampVolume(value: unknown, fallback: number = 1): number {
  if (typeof value != "number" || !Number.isFinite(value)) return fallback;
  return mathLimit(value, 0, 1);
}

/**
 * Volume to play a sound with: master volume × sound volume, limited to 0–1.
 * Only the product is limited, so a sound volume > 1 raises a quiet sound as
 * far as the master volume leaves headroom (at master 1 it plays as with 1).
 * `master` must already be validated (personal settings parser).
 */
export function effectiveVolume(master: number, soundVolume: number): number {
  return clampVolume(master * soundVolume);
}
