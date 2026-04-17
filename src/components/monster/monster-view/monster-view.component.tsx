import { Component, ReactNode } from "react";

import { Monster, MonsterManager } from "../../../model";
import { formatLargeNumber } from "../../../utils";
import { ImgButton } from "../../ui";

import closeImg from "/icons/failed.svg";
import targetImg from "/icons/target.svg";
import editImg from "/icons/edit.svg";
import reloadImg from "/icons/reload.svg";
import imagePlaceholder from "/image-placeholder.png";

import "./monster-view.css";

interface Props {
  monster: Monster;
  onClose?: () => void;
  hideActions?: boolean;
}
interface State {
  innerMonster: Monster;
}

export class MonsterView extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      innerMonster: props.monster,
    };
  }

  async componentDidMount(): Promise<void> {}

  // State
  async setStatePromise(state: State): Promise<void> {
    return new Promise<void>((resolve) => this.setState(state, resolve));
  }

  async setInnerMonster(monster: Monster): Promise<void> {
    await this.setStatePromise({ ...this.state, innerMonster: monster });
  }

  // handler
  async placeMonster(): Promise<void> {
    console.log("Placing monster:", this.state.innerMonster);
  }

  async loadFullMonster(): Promise<void> {
    if (!this.state.innerMonster.armorClass) {
      console.log("Loading full monster data for:", this.state.innerMonster);
      MonsterManager.updateMonster(this.state.innerMonster).then(
        (updatedMonster) => this.setInnerMonster(updatedMonster),
      );
    }
  }

  async setMonsterImage(): Promise<void> {
    const currentImageLink = this.state.innerMonster.imgLink ?? "";
    const newImageLink = window.prompt(
      currentImageLink
        ? "Enter a new image URL for this monster"
        : "Enter an image URL for this monster",
      currentImageLink,
    );

    if (newImageLink === null) {
      return;
    }

    const normalizedLink = newImageLink.trim();
    if (!normalizedLink || normalizedLink === currentImageLink) {
      return;
    }

    try {
      new URL(normalizedLink);
    } catch (error: unknown) {
      console.error("Invalid image URL provided", {
        monster: this.state.innerMonster.name,
        link: normalizedLink,
        error,
      });
      return;
    }

    MonsterManager.overrideImage(this.state.innerMonster, normalizedLink);
    await this.setInnerMonster({
      ...this.state.innerMonster,
      imgLink: normalizedLink,
    });
  }

  // render
  render(): ReactNode {
    this.loadFullMonster();
    const monster = this.state.innerMonster;
    const savingThrows = this.renderNamedBonuses(monster.savingThrows);
    const skills = this.renderNamedBonuses(monster.skills);
    const metaParts = [monster.size, monster.type]
      .filter(Boolean)
      .join(" ")
      .trim();
    const subtitle = [metaParts, monster.alignment].filter(Boolean).join(", ");

    console.debug("Rendering monster view for:", monster);

    return (
      <>
        <div className="monster-view">
          {!this.props.hideActions && (
            <div className="actions">
              <ImgButton
                img={reloadImg}
                alt="Reload"
                className={"reload-button"}
                onClick={() => {
                  MonsterManager.updateMonster(this.state.innerMonster).then(
                    (updatedMonster) => {
                      this.setInnerMonster(updatedMonster);
                      console.log("Reloaded monster data:", updatedMonster);
                    },
                  );
                }}
              />
              <ImgButton
                img={targetImg}
                alt="Place"
                className={"place-button"}
                onClick={() => this.placeMonster()}
              />
              <ImgButton
                img={closeImg}
                alt="Close"
                className={"close-button"}
                onClick={() => this.props.onClose?.()}
              />
            </div>
          )}
          <div className="monster-statblock">
            <div className="monster-portrait-wrap">
              {monster.imgLink ? (
                <img
                  className="monster-portrait"
                  src={monster.imgLink}
                  alt={monster.name}
                  loading="lazy"
                />
              ) : (
                <img
                  className="monster-portrait monster-portrait-placeholder"
                  src={imagePlaceholder}
                  alt="Monster placeholder"
                  loading="lazy"
                />
              )}

              <div className="monster-portrait-action">
                <ImgButton
                  img={editImg}
                  alt={monster.imgLink ? "Change image" : "Set image"}
                  className={"monster-image-edit-icon"}
                  onClick={() => this.setMonsterImage()}
                />
              </div>
            </div>

            <header className="monster-header">
              <h1>{monster.name}</h1>
              {subtitle && <p className="monster-meta">{subtitle}</p>}
            </header>

            <div className="monster-divider" />

            <section className="monster-core-stats">
              {monster.armorClass && (
                <p>
                  <strong>Armor Class</strong> {monster.armorClass}
                </p>
              )}
              {monster.hitPoints && (
                <p>
                  <strong>Hit Points</strong> {monster.hitPoints.average}
                  {(monster.hitPoints.d4 > 0 ||
                    monster.hitPoints.d6 > 0 ||
                    monster.hitPoints.d8 > 0 ||
                    monster.hitPoints.d10 > 0 ||
                    monster.hitPoints.d12 > 0 ||
                    monster.hitPoints.d20 > 0) && (
                    <>
                      {" "}
                      (
                      {[4, 6, 8, 10, 12, 20]
                        .map((die) => {
                          const count =
                            monster.hitPoints?.[
                              `d${die}` as keyof Monster["hitPoints"]
                            ];
                          if (
                            !count ||
                            typeof count !== "number" ||
                            count <= 0
                          ) {
                            return undefined;
                          }
                          return `${count}d${die}`;
                        })
                        .filter(Boolean)
                        .join(" + ")}
                      {monster.hitPoints.modifier !== 0 && (
                        <>
                          {monster.hitPoints.modifier > 0 ? " + " : " - "}
                          {Math.abs(monster.hitPoints.modifier)}
                        </>
                      )}
                      )
                    </>
                  )}
                </p>
              )}
              {monster.speed && (
                <p>
                  <strong>Speed</strong> {monster.speed}
                </p>
              )}
            </section>

            <div className="monster-divider" />

            <section className="monster-abilities">
              <div>
                <h4>STR</h4>
                <p>{monster.strength ?? "--"}</p>
                <span>
                  ({MonsterManager.getAbilityModifier(monster.strength)})
                </span>
              </div>
              <div>
                <h4>DEX</h4>
                <p>{monster.dexterity ?? "--"}</p>
                <span>
                  ({MonsterManager.getAbilityModifier(monster.dexterity)})
                </span>
              </div>
              <div>
                <h4>CON</h4>
                <p>{monster.constitution ?? "--"}</p>
                <span>
                  ({MonsterManager.getAbilityModifier(monster.constitution)})
                </span>
              </div>
              <div>
                <h4>INT</h4>
                <p>{monster.intelligence ?? "--"}</p>
                <span>
                  ({MonsterManager.getAbilityModifier(monster.intelligence)})
                </span>
              </div>
              <div>
                <h4>WIS</h4>
                <p>{monster.wisdom ?? "--"}</p>
                <span>
                  ({MonsterManager.getAbilityModifier(monster.wisdom)})
                </span>
              </div>
              <div>
                <h4>CHA</h4>
                <p>{monster.charisma ?? "--"}</p>
                <span>
                  ({MonsterManager.getAbilityModifier(monster.charisma)})
                </span>
              </div>
            </section>

            <div className="monster-divider" />

            <section className="monster-details">
              {savingThrows && (
                <p>
                  <strong>Saving Throws</strong> {savingThrows}
                </p>
              )}
              {skills && (
                <p>
                  <strong>Skills</strong> {skills}
                </p>
              )}
              {monster.damageVulnerabilities && (
                <p>
                  <strong>Damage Vulnerabilities</strong>{" "}
                  {monster.damageVulnerabilities}
                </p>
              )}
              {monster.damageResistances && (
                <p>
                  <strong>Damage Resistances</strong>{" "}
                  {monster.damageResistances}
                </p>
              )}
              {monster.damageImmunities && (
                <p>
                  <strong>Damage Immunities</strong> {monster.damageImmunities}
                </p>
              )}
              {monster.conditionImmunities && (
                <p>
                  <strong>Condition Immunities</strong>{" "}
                  {monster.conditionImmunities}
                </p>
              )}
              {monster.senses && (
                <p>
                  <strong>Senses</strong> {monster.senses}
                </p>
              )}
              {monster.languages && (
                <p>
                  <strong>Languages</strong> {monster.languages}
                </p>
              )}
              {monster.challengeRating && (
                <p>
                  <strong>Challenge</strong>
                  <span className="challenge-cr">
                    {monster.challengeRating}
                  </span>
                  <span className="challenge-xp">
                    (
                    <span className="challenge-xp-value">
                      {formatLargeNumber(
                        MonsterManager.getXPValue(monster.challengeRating),
                      )}
                    </span>{" "}
                    XP)
                  </span>
                </p>
              )}
            </section>

            {monster.psionics && (
              <section className="monster-section">
                <h3>Psionics</h3>
                <div className="monster-section-body">
                  <p>
                    <strong>Charges:</strong> {monster.psionics.charges} |{" "}
                    <strong>Recharge:</strong> {monster.psionics.recharge} |{" "}
                    <strong>Fracture:</strong> {monster.psionics.fracture}
                  </p>
                </div>
              </section>
            )}

            {monster.traits && monster.traits.length > 0 && (
              <section className="monster-section">
                <h3>Traits</h3>
                <div className="monster-section-body">
                  {this.renderNamedEntries(monster.traits)}
                </div>
              </section>
            )}

            {monster.actions && monster.actions.length > 0 && (
              <section className="monster-section">
                <h3>Actions</h3>
                <div className="monster-section-body">
                  {this.renderNamedEntries(monster.actions)}
                </div>
              </section>
            )}

            {this.renderSpecialAction(
              "Legendary Actions",
              monster.legendaryAction,
            )}
            {this.renderSpecialAction("Mythic Actions", monster.mysticAction)}
            {this.renderSpecialAction("Lair Actions", monster.lairAction)}
          </div>
        </div>
      </>
    );
  }

  //region Helpers

  private renderNamedBonuses(
    entries?: Array<{ name: string; value: number }>,
  ): string | undefined {
    if (!entries || entries.length === 0) {
      return undefined;
    }

    return entries
      .map(
        (entry) => `${entry.name} ${entry.value >= 0 ? "+" : ""}${entry.value}`,
      )
      .join(", ");
  }

  private renderNamedEntries(
    entries?: Array<{ name: string; description: string }>,
  ): ReactNode {
    if (!entries || entries.length === 0) {
      return undefined;
    }

    return entries.map((entry) => (
      <p key={`${entry.name}-${entry.description.slice(0, 25)}`}>
        <strong>{entry.name}.</strong> {entry.description}
      </p>
    ));
  }

  private renderSpecialAction(
    title: string,
    action?: {
      description: string;
      actions: Array<{ name?: string; description: string }>;
    },
  ): ReactNode {
    if (!action) {
      return undefined;
    }

    const namedActions: Array<{ name: string; description: string }> = [];
    const unnamedActions: Array<{ name?: string; description: string }> = [];
    action.actions.forEach((a) => {
      if (a.name) {
        namedActions.push(a as { name: string; description: string });
      } else {
        unnamedActions.push(a);
      }
    });

    return (
      <section className="monster-section">
        <h3>{title}</h3>
        <div className="monster-section-body">
          {action.description && <p>{action.description}</p>}
          {this.renderNamedEntries(namedActions)}
          {unnamedActions.length > 0 && (
            <ul className="unnamed-actions">
              {unnamedActions.map((a, index) => (
                <li key={`unnamed-${index}`}>{a.description}</li>
              ))}
            </ul>
          )}
        </div>
      </section>
    );
  }

  //endregion
}
