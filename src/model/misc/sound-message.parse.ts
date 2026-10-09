import { SoundMessage } from "./sound-message.interface";

/**
 * Validates an untrusted sound broadcast payload. Only checks the shape;
 * whether name and index exist is checked against the sound catalog.
 */
export function parseSoundMessage(value: unknown): SoundMessage | undefined {
  if (typeof value != "object" || value === null) return undefined;
  if (!("name" in value) || typeof value.name != "string") return undefined;

  if (!("index" in value) || value.index === undefined)
    return { name: value.name };
  if (typeof value.index != "number" || !Number.isInteger(value.index))
    return undefined;
  return { name: value.name, index: value.index };
}
