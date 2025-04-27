import React, { Component, ReactNode } from "react";

import "./settings-controller.css";
import bauImg from "/bau.svg";

import { Owlbear } from "../../../owlbear";
import { downloadObjectAsJson, Log } from "../../../utils";
import {
  DefaultGlobalSettings,
  GlobalSettings,
  PersonalSettings,
  DefaultPersonalSettings,
  PersonalSettingsController,
  ICharacter,
  Character,
} from "../../../model";
import { ImgButton } from "../../ui";

type Props = object;
interface State {
  gm: boolean;
  globalSettings: GlobalSettings;
  personalSettings: PersonalSettings;
}

export class SettingsController extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      gm: false,
      globalSettings: DefaultGlobalSettings,
      personalSettings: DefaultPersonalSettings,
    };
  }

  async componentDidMount(): Promise<void> {
    await this.setGM(await Owlbear.isGM());
    await this.setStatePromise({
      ...this.state,
      personalSettings: PersonalSettingsController.load(),
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
  async setGM(gm: boolean): Promise<void> {
    await this.setStatePromise({ ...this.state, gm });
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

  // handler
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

  protected importFileElement: HTMLInputElement | null = null;

  // render
  render(): ReactNode {
    return (
      <>
        <div className="settings-controller">
          <fieldset className="personal-settings settings-area">
            <legend>
              <h2>Personal Settings</h2>
              <ImgButton
                img={bauImg}
                alt="Bau Bau"
                onClick={() => Owlbear.settings.sendBau()}
              />
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
                    onClick={() => this.importFileElement?.click()}
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
                      this.importFileElement = el;
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
            </fieldset>
          )}
        </div>
      </>
    );
  }
}
