import OBR, { Metadata } from "@owlbear-rodeo/sdk";

import { GlobalSettings, DefaultGlobalSettings, Sound, Backup } from "../model";
import { Log } from "../utils";

import {
  DIR_SOUND,
  BROADCAST,
  METADATA_SETTINGS,
  STORAGE_KEY_BACKUPS,
} from "./constants";
import { Owlbear } from ".";

export class OwlbearSettings {
  protected readonly ready: Promise<void>;
  constructor(ready: Promise<void>) {
    this.ready = ready;
    this.load().then((settings) => (this._settings = settings));
    this.registerOnUpdate((settings) => {
      this._settings = settings;
    });
  }

  protected _settings: GlobalSettings = DefaultGlobalSettings;
  get<K extends keyof GlobalSettings>(setting: K): GlobalSettings[K] {
    return this._settings[setting];
  }

  async save(settings: GlobalSettings): Promise<void> {
    settings.lastUpdate = new Date().getTime();
    Log.debug("OwlbearSettings", "SAVE", settings);
    await this.ready;

    // save
    const update: Partial<Metadata> = {};
    update[METADATA_SETTINGS] = settings;

    await OBR.room.setMetadata(update);
    Log.trace("OwlbearSettings", "save", update);
  }

  async load(): Promise<GlobalSettings> {
    await this.ready;

    const metadata = await OBR.room.getMetadata();
    return this.extractSettings(metadata);
  }

  async registerOnUpdate(
    onUpdate: (settings: GlobalSettings) => void | Promise<void>
  ): Promise<void> {
    await this.ready;
    OBR.room.onMetadataChange(async (metadata) => {
      const settings = this.extractSettings(metadata);
      await onUpdate(settings);
    });
  }

  private extractSettings(metadata: Metadata): GlobalSettings {
    try {
      const settings = metadata[METADATA_SETTINGS];
      if (!settings) return DefaultGlobalSettings;
      return settings as GlobalSettings;
    } catch {
      return DefaultGlobalSettings;
    }
  }

  // Message
  async setupMessageListener(): Promise<void> {
    this.listenSound();
  }

  // Sound
  private async listenSound(): Promise<void> {
    await this.ready;
    OBR.broadcast.onMessage(`${BROADCAST}/sound`, async (message) => {
      const file = message.data;
      if (typeof file != "string") return;
      const sound = new Audio(`${DIR_SOUND}/${file}`);
      sound.muted = true;
      sound.muted = false;
      await sound.play();
    });
  }

  async playSound(sound: Sound): Promise<void> {
    await this.ready;
    const file =
      typeof sound.file == "string"
        ? sound.file
        : sound.file[Math.floor(Math.random() * sound.file.length)];
    await OBR.broadcast.sendMessage(`${BROADCAST}/sound`, file, {
      destination: "ALL",
    });
  }

  // Backup
  private getBackupStorageKey(): string {
    const roomName = OBR.room.id;
    const storageKey = `${STORAGE_KEY_BACKUPS}/${roomName}`;
    return storageKey;
  }

  private async saveBackupList(backups: Backup[]): Promise<Backup[]> {
    localStorage.setItem(this.getBackupStorageKey(), JSON.stringify(backups));
    return backups;
  }

  async createBackup(): Promise<Backup[]> {
    await this.ready;

    const backup: Backup = {
      type: "Backup",
      date: Date.now(),
      settings: await Owlbear.settings.load(),
      character: Object.values(await Owlbear.character.loadAll),
      timeInfo: await Owlbear.time.load(),
      puzzle: {
        current: await Owlbear.puzzle.loadCurrentPuzzle(),
        list: await Owlbear.puzzle.loadList(),
      },
    };

    const oldBackups = await this.loadBackups();
    oldBackups.push(backup);
    return await this.saveBackupList(oldBackups);
  }

  async importBackup(backup: Backup): Promise<Backup[]> {
    await this.ready;
    backup.type = "Import";
    const oldBackups = await this.loadBackups();
    oldBackups.push(backup);
    return await this.saveBackupList(oldBackups);
  }

  async loadBackups(): Promise<Backup[]> {
    const rawBackups = localStorage.getItem(
      this.getBackupStorageKey()
    ) as string;
    try {
      const backups = JSON.parse(rawBackups);
      if (!backups) return [];
      if (!Array.isArray(backups)) {
        Log.error("OwlbearSettings:OwlbearSettings", "unkown format", backups);
        return [];
      }
      return backups;
    } catch {
      return [];
    }
  }

  async loadBackup(backup: Backup): Promise<void> {
    await Owlbear.settings.save(backup.settings);
    await Owlbear.character.overwriteAll(backup.character);
    await Owlbear.time.save(backup.timeInfo);
    await Owlbear.puzzle.saveCurrentPuzzle(backup.puzzle.current);
    await Owlbear.puzzle.saveList(backup.puzzle.list);
  }

  async deleteBackup(
    type: Backup["type"],
    date: Backup["date"]
  ): Promise<Backup[]> {
    const oldBackups = await this.loadBackups();
    const filteredBackups = oldBackups.filter(
      (backups) => backups.date != date || backups.type != type
    );
    return await this.saveBackupList(filteredBackups);
  }
}
