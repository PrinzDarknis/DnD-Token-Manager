import { DefaultPersonalSettings } from "./personal-settings.default";
import { PersonalSettings } from "./personal-settings.interface";

export abstract class PersonalSettingsController {
  protected static readonly StorageKey = "PersonalSettings";

  static save(settings: PersonalSettings): void {
    localStorage.setItem(
      PersonalSettingsController.StorageKey,
      JSON.stringify(settings)
    );
  }

  static load(): PersonalSettings {
    try {
      const settings = localStorage.getItem(
        PersonalSettingsController.StorageKey
      );
      if (!settings) return DefaultPersonalSettings;
      return JSON.parse(settings);
    } catch {
      return DefaultPersonalSettings;
    }
  }
}
