import { Component, ReactNode } from "react";

import "./settings-controller.css";

import { Owlbear } from "../../../owlbear";
import {
  DefaultGlobalSettings,
  GlobalSettings,
  PersonalSettings,
  DefaultPersonalSettings,
  PersonalSettingsController,
} from "../../../model";

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
