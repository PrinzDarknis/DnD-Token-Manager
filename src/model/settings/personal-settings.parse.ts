// direct import: the utils barrel pulls in the logger and the OBR facade
import { clampVolume } from "../../utils/volume.service";

import { DefaultPersonalSettings } from "./personal-settings.default";
import { PersonalSettings } from "./personal-settings.interface";

/**
 * Parses untrusted personal settings (localStorage). Missing or invalid values
 * fall back to the defaults. Always returns a new object, so callers may
 * mutate it without touching `DefaultPersonalSettings`.
 */
export function parsePersonalSettings(value: unknown): PersonalSettings {
  const settings: PersonalSettings = { ...DefaultPersonalSettings };
  if (typeof value != "object" || value === null) return settings;

  if ("master-volume" in value)
    settings["master-volume"] = clampVolume(
      value["master-volume"],
      DefaultPersonalSettings["master-volume"]
    );
  return settings;
}
