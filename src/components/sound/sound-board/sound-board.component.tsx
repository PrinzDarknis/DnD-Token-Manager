import { Component, ReactNode } from "react";

import "./sound-board.css";

import { PersonalSettingsController, Sound } from "../../../model";
import { DIR_SOUND, Owlbear } from "../../../owlbear";
import { effectiveVolume, Log } from "../../../utils";

import { ImgButton, spaceEvenly } from "../../ui";

import { Sounds } from "./sound-board.constant";

import playImg from "/icons/play.svg";

const TEST_SOUND_FILE = "chokobo.mp3";

type Props = object;
interface State {
  iconsPerLine: number;
  masterVolume: number;
}

export class SoundBoard extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      iconsPerLine: 5,
      masterVolume: PersonalSettingsController.load()["master-volume"],
    };
  }

  async componentDidMount(): Promise<void> {}

  // State
  async setStatePromise(state: State): Promise<void> {
    return new Promise<void>((resolve) => this.setState(state, resolve));
  }

  get iconsPerLine(): number {
    return this.state.iconsPerLine;
  }

  get masterVolume(): number {
    return this.state.masterVolume;
  }
  async setMasterVolume(masterVolume: number): Promise<void> {
    // load fresh to keep other personal settings; the parser clamps on read
    const settings = PersonalSettingsController.load();
    settings["master-volume"] = masterVolume;
    PersonalSettingsController.save(settings);
    await this.setStatePromise({ ...this.state, masterVolume });
  }

  // handler
  async playSound(sound: Sound): Promise<void> {
    Owlbear.settings.playSound(sound);
  }

  /** Plays a sample only for this player, to try out the master volume. */
  async playTestSound(): Promise<void> {
    const soundVolume =
      Sounds.find((sound) => sound.file == TEST_SOUND_FILE)?.volume ?? 1;
    const audio = new Audio(`${DIR_SOUND}/${TEST_SOUND_FILE}`);
    audio.volume = effectiveVolume(this.masterVolume, soundVolume);
    try {
      await audio.play();
    } catch (error) {
      Log.warn("SoundBoard:playTestSound", "Playback failed", error);
    }
  }

  // render
  render(): ReactNode {
    return (
      <>
        <div className="sound-board">
          <fieldset className="sound-board__volume settings-area">
            <legend>
              <h2>Volume</h2>
            </legend>
            <div className="sound-board__volume-row">
              <ImgButton
                img={playImg}
                alt="Test volume"
                onClick={() => this.playTestSound()}
              />
              <input
                className="sound-board__volume-slider"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={this.masterVolume}
                aria-label="Volume"
                onChange={(e) => this.setMasterVolume(e.target.valueAsNumber)}
              />
              <span className="sound-board__volume-value">
                {Math.round(this.masterVolume * 100)}%
              </span>
            </div>
          </fieldset>
          <fieldset className="personal-settings settings-area">
            <legend>
              <h2>Sound Board</h2>
            </legend>
            {spaceEvenly(
              Sounds.map((sound) => (
                <ImgButton
                  key={`sound-${sound.name}`}
                  img={sound.img}
                  alt={sound.name}
                  onClick={() => this.playSound(sound)}
                />
              )),
              Math.ceil(Sounds.length / this.iconsPerLine),
            )}
          </fieldset>
        </div>
      </>
    );
  }
}
