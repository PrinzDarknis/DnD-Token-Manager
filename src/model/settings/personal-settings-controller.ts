import { Log } from "../../utils";

import { PersonalSettings } from "./personal-settings.interface";
import { parsePersonalSettings } from "./personal-settings.parse";

export abstract class PersonalSettingsController {
  protected static readonly StorageKey = "PersonalSettings";

  static save(settings: PersonalSettings): void {
    try {
      localStorage.setItem(
        PersonalSettingsController.StorageKey,
        JSON.stringify(settings)
      );
    } catch (error) {
      // storage blocked (private window, cookies disabled) or quota exceeded
      Log.warn("PersonalSettingsController", "Could not save", error);
    }
  }

  static load(): PersonalSettings {
    try {
      const settings = localStorage.getItem(
        PersonalSettingsController.StorageKey
      );
      return parsePersonalSettings(settings ? JSON.parse(settings) : undefined);
    } catch {
      return parsePersonalSettings(undefined);
    }
  }
}
