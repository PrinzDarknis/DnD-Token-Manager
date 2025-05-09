import React, { Component, ReactNode } from "react";

import "./settings-controller.css";
import upImg from "/icons/up.svg";
import downImg from "/icons/down.svg";
import trashImg from "/trash.svg";
import plusImg from "/icons/plus.svg";

import { Owlbear } from "../../../owlbear";
import { downloadObjectAsJson, goodTimeString, Log } from "../../../utils";
import {
  DefaultGlobalSettings,
  GlobalSettings,
  PersonalSettings,
  DefaultPersonalSettings,
  PersonalSettingsController,
  ICharacter,
  Character,
  Backup,
} from "../../../model";
import { ImgButton, readFile, spaceEvenly } from "../../ui";

type Props = object;
interface State {
  gm: boolean;
  globalSettings: GlobalSettings;
  personalSettings: PersonalSettings;
  backups: Backup[];
}

export class SettingsController extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      gm: false,
      globalSettings: DefaultGlobalSettings,
      personalSettings: DefaultPersonalSettings,
      backups: [],
    };
  }

  async componentDidMount(): Promise<void> {
    await this.setStatePromise({
      ...this.state,
      gm: await Owlbear.isGM(),
      personalSettings: PersonalSettingsController.load(),
      backups: await Owlbear.settings.loadBackups(),
    });
    if (this.gm) {
      await this.setStatePromise({
        ...this.state,
        globalSettings: await Owlbear.settings.load(),
      });

      Owlbear.settings.registerOnUpdate(async (settings) => {
        if (settings.lastUpdate > this.state.globalSettings.lastUpdate)
          await this.setStatePromise({
            ...this.state,
            globalSettings: settings,
          });
      });
    }
  }

  // State
  async setStatePromise(state: State): Promise<void> {
    return new Promise<void>((resolve) => this.setState(state, resolve));
  }

  get gm(): boolean {
    return this.state.gm;
  }

  get backups(): Backup[] {
    return this.state.backups;
  }
  async setBackups(backups: Backup[]): Promise<void> {
    await this.setStatePromise({ ...this.state, backups });
  }

  async updateGlobalSettings<K extends keyof GlobalSettings>(
    property: K,
    value: GlobalSettings[K]
  ): Promise<void> {
    if (!this.gm) return;

    const settings = this.state.globalSettings;
    settings[property] = value;
    await this.setStatePromise({ ...this.state, globalSettings: settings });
    await Owlbear.settings.save(settings);
  }

  async updatePersonalSettings<K extends keyof PersonalSettings>(
    property: K,
    value: PersonalSettings[K]
  ): Promise<void> {
    const settings = this.state.personalSettings;
    settings[property] = value;
    await this.setStatePromise({ ...this.state, personalSettings: settings });
    PersonalSettingsController.save(settings);
  }

  // Character Im- and Export
  protected importCharacterFileElement: HTMLInputElement | null = null;

  async export(): Promise<void> {
    const chars = await Owlbear.character.loadAll();
    const exportData = Object.values(chars).map((char) =>
      char.toSimpleObject()
    );
    downloadObjectAsJson(
      exportData,
      `character-${new Date().toISOString().split("T")[0]}`
    );
  }

  async import(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const rawData: ICharacter[] = JSON.parse(reader.result as string);
        if (!Array.isArray(rawData))
          throw new Error(
            `JSON content is not an array, got ${typeof rawData}`
          );
        const chars = rawData
          .map((charData) => Character.restore(charData))
          .filter((char) => !!char);
        Owlbear.character.overwriteAll(chars);
      } catch (error) {
        Log.error(
          "SettingsController:import",
          "Error while reading import data",
          error
        );
      }
      // reset input
      e.target.value = "";
    };
    reader.readAsText(file);
  }

  // Backups
  protected importBackupFileElement: HTMLInputElement | null = null;

  async createBackup(): Promise<void> {
    await this.setBackups(await Owlbear.settings.createBackup());
  }

  async deleteBackup(
    type: Backup["type"],
    date: Backup["date"]
  ): Promise<void> {
    await this.setBackups(await Owlbear.settings.deleteBackup(type, date));
  }

  async importBackup(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const backup = await readFile<Backup>(e.target.files?.[0]);
    e.target.value = "";
    if (!backup) return;
    await this.setBackups(await Owlbear.settings.importBackup(backup));
  }

  async exportBackup(backup: Backup): Promise<void> {
    downloadObjectAsJson(backup, this.getBackupName(backup));
  }

  async loadBackup(backup: Backup): Promise<void> {
    if (
      !confirm(
        "Are you sure you want to load this backup? It's overwrites all current data."
      )
    )
      return;
    await Owlbear.settings.loadBackup(backup);
  }

  private getBackupName(backup: Backup): string {
    return `${backup.type} ${goodTimeString(new Date(backup.date))}`;
  }

  // render
  render(): ReactNode {
    return (
      <>
        <div className="settings-controller">
          <fieldset className="personal-settings settings-area">
            <legend>
              <h2>Personal Settings</h2>
            </legend>
          </fieldset>
          {this.gm && (
            <fieldset className="global-settings settings-area">
              <legend>
                <h2>Global Settings</h2>
              </legend>
              <fieldset>
                <legend>
                  <h3>Character</h3>
                </legend>
                <div className="setting setting-import-export">
                  <span className="spacer"></span>
                  <button
                    className="char-import"
                    type="button"
                    onClick={() => this.importCharacterFileElement?.click()}
                  >
                    Import
                  </button>
                  <span className="spacer"></span>
                  <button
                    className="char-export"
                    type="button"
                    onClick={() => this.export()}
                  >
                    Export
                  </button>
                  <input
                    ref={(el) => {
                      this.importCharacterFileElement = el;
                    }}
                    id="file-upload"
                    type="file"
                    onChange={(e) => this.import(e)}
                    hidden
                  />
                  <span className="spacer"></span>
                </div>
              </fieldset>
              <fieldset>
                <legend>
                  <h3>Plugins</h3>
                </legend>
                <div className="setting setting-bool">
                  <input
                    type="checkbox"
                    checked={this.state.globalSettings["plugin-bubbles"]}
                    name="global-settings-plugin-bubbles"
                    onChange={(e) =>
                      this.updateGlobalSettings(
                        "plugin-bubbles",
                        e.target.checked
                      )
                    }
                  />
                  <label htmlFor="global-settings-plugin-bubbles">
                    Stat Bubbles for D&D
                  </label>
                </div>
              </fieldset>
              <fieldset>
                <legend>
                  <h3>Backups</h3>
                </legend>
                <div className="setting setting-table backup-table">
                  <table className="design-table">
                    <thead>
                      <tr>
                        <td className="setting-table-header">Name</td>
                        <td className="setting-table-header th-icon">Load</td>
                        <td className="setting-table-header th-icon">
                          Download
                        </td>
                        <td className="setting-table-header th-icon">Delete</td>
                      </tr>
                    </thead>
                    <tbody>
                      {this.backups.map((backup, idx) => (
                        <tr key={`setting-table-row-${idx}`}>
                          <td className="setting-table-data setting-table-data-name">
                            {this.getBackupName(backup)}
                          </td>
                          <td className="setting-table-data table-icon">
                            <ImgButton
                              img={upImg}
                              alt="load"
                              onClick={() => this.loadBackup(backup)}
                            />
                          </td>
                          <td className="setting-table-data table-icon">
                            <ImgButton
                              img={downImg}
                              alt="download"
                              onClick={() => this.exportBackup(backup)}
                            />
                          </td>
                          <td className="setting-table-data table-icon">
                            <ImgButton
                              img={trashImg}
                              alt="delete"
                              onClick={() =>
                                this.deleteBackup(backup.type, backup.date)
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="setting setting-buttons backup-buttons">
                  {spaceEvenly(
                    [
                      <ImgButton
                        key={"backup-general-buttons-create"}
                        img={plusImg}
                        alt="Create Backup"
                        onClick={() => this.createBackup()}
                      />,
                      <ImgButton
                        key={"backup-general-buttons-import"}
                        img={upImg}
                        alt="Import"
                        onClick={() => this.importBackupFileElement?.click()}
                      />,
                    ],
                    1,
                    "backup-general-buttons"
                  )}
                  <input
                    ref={(el) => {
                      this.importBackupFileElement = el;
                    }}
                    id="file-upload-backup"
                    type="file"
                    onChange={(e) => this.importBackup(e)}
                    hidden
                  />
                </div>
              </fieldset>
            </fieldset>
          )}
        </div>
      </>
    );
  }
}
