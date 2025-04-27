import OBR, { Metadata } from "@owlbear-rodeo/sdk";

import { GlobalSettings, DefaultGlobalSettings } from "../model";
import { Log } from "../utils";

import { DIR_SOUND, METADATA_BROADCAST, METADATA_SETTINGS } from "./constants";

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
    this.listenBauMessage();
  }

  // Bau Bau
  private async listenBauMessage(): Promise<void> {
    await this.ready;
    OBR.broadcast.onMessage(
      `${METADATA_BROADCAST}/bau`,
      async (raw: unknown) => {
        const message: { data: string; connectionId: string } = raw as {
          data: string;
          connectionId: string;
        };
        const bau = message.data;
        const file =
          bau == "Fuwawa"
            ? "Fuwawa  Bau.mp3"
            : bau == "Mococo"
            ? "Mococo Bau.mp3"
            : undefined;
        if (!file) return;
        const sound = new Audio(`${DIR_SOUND}/${file}`);
        sound.muted = true;
        sound.muted = false;
        await sound.play();
      }
    );
  }

  async sendBau(): Promise<void> {
    await this.ready;
    const whichBau = Math.round(Math.random() * 1000) % 2;
    const bau = whichBau == 1 ? "Fuwawa" : "Mococo";
    await OBR.broadcast.sendMessage(`${METADATA_BROADCAST}/bau`, bau, {
      destination: "ALL",
    });
  }
}
