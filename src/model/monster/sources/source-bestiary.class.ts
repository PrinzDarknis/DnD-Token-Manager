import { Monster } from "../monster.interface";
import { MonsterSource } from "./monster-source.class";

export class SourceBestiary extends MonsterSource {
  protected readonly LIST_URL = "https://5ecompendium.github.io/bestiary/cr";
  public readonly SOURCE_NAME = "Bestiary";
  private readonly LOG_PREFIX = "[SourceBestiary]";

  //region List

  async _updateList(): Promise<Monster[]> {
    try {
      const response = await fetch(this.LIST_URL);
      if (!response.ok) {
        return [];
      }

      const listHtml = await response.text();
      return this.parseList(listHtml);
    } catch {
      return [];
    }
  }

  protected parseList(listHtml: string): Monster[] {
    const parser = new DOMParser();
    const document = parser.parseFromString(listHtml, "text/html");

    const monsters: Monster[] = [];
    const seenLinks = new Set<string>();
    let currentChallengeRating: string | undefined;

    const nodes = document.querySelectorAll("h2, a");
    for (const node of nodes) {
      if (node.tagName === "H2") {
        const heading = node.textContent?.trim() ?? "";
        const challengeMatch = heading.match(/^Challenge\s+(.+)$/i);
        if (challengeMatch) {
          currentChallengeRating = challengeMatch[1].trim();
        } else {
          currentChallengeRating = undefined;
        }
        continue;
      }

      const anchor = node as HTMLAnchorElement;
      const name = anchor.textContent?.trim() ?? "";
      const href = anchor.getAttribute("href")?.trim() ?? "";
      if (!name || !href || !currentChallengeRating) {
        continue;
      }

      const link = new URL(href, this.LIST_URL).toString();
      if (!link.includes("/bestiary/creature/")) {
        continue;
      }

      if (seenLinks.has(link)) {
        continue;
      }
      seenLinks.add(link);

      monsters.push({
        link,
        source: this.SOURCE_NAME,
        name,
        challengeRating: currentChallengeRating,
      });
    }

    return monsters;
  }

  //endregion

  //region Single Monster

  protected async _updateMonster(monster: Monster): Promise<Monster> {
    if (monster.source !== this.SOURCE_NAME) {
      throw new Error(
        `Monster source mismatch: expected "${this.SOURCE_NAME}", got "${monster.source}"`,
      );
    }

    if (!monster.link) {
      return monster;
    }

    try {
      const response = await fetch(monster.link);
      if (!response.ok) {
        return monster;
      }

      const html = await response.text();
      const parser = new DOMParser();
      const document = parser.parseFromString(html, "text/html");

      const updatedMonster: Monster = { ...monster };

      this.parseSafely(
        "name",
        () => {
          const heading = document.querySelector("h1")?.textContent?.trim();
          if (heading) {
            updatedMonster.name = heading;
          }
        },
        monster,
      );

      this.parseSafely(
        "size/type/alignment",
        () => {
          const subtitle = document.querySelector("h2")?.textContent?.trim();
          if (!subtitle) {
            return;
          }

          const [leftPart, alignmentPart] = subtitle
            .split(",", 2)
            .map((part) => part.trim());
          if (alignmentPart) {
            updatedMonster.alignment = alignmentPart;
          }

          if (!leftPart) {
            return;
          }

          const [size, ...typeParts] = leftPart.split(/\s+/);
          if (size) {
            updatedMonster.size = size;
          }

          const type = typeParts.join(" ").trim();
          if (type) {
            updatedMonster.type = type;
          }
        },
        monster,
      );

      this.parseSafely(
        "armor class",
        () => {
          const armorClass = this.getStatText(document, "Armor Class");
          if (armorClass) {
            updatedMonster.armorClass = armorClass;

            const armorClassValueMatch = armorClass.match(/-?\d+/);
            if (armorClassValueMatch) {
              const armorClassValue = Number(armorClassValueMatch[0]);
              if (Number.isFinite(armorClassValue)) {
                updatedMonster.armorClassValue = armorClassValue;
              }
            }
          }
        },
        monster,
      );

      this.parseSafely(
        "hit points",
        () => {
          const hitPointsText = this.getStatText(document, "Hit Points");
          if (!hitPointsText) {
            return;
          }

          const averageMatch = hitPointsText.match(/^(\d+)/);
          if (!averageMatch) {
            return;
          }

          const parsedHitPoints = {
            average: Number(averageMatch[1]),
            d4: 0,
            d6: 0,
            d8: 0,
            d10: 0,
            d12: 0,
            d20: 0,
            modifier: 0,
          };

          const diceMatchRegex = /(\d+)d(4|6|8|10|12|20)/g;
          let diceMatch: RegExpExecArray | null = null;
          while ((diceMatch = diceMatchRegex.exec(hitPointsText)) !== null) {
            const amount = Number(diceMatch[1]);
            const die = Number(diceMatch[2]);

            if (!Number.isFinite(amount) || !Number.isFinite(die)) {
              continue;
            }

            if (die === 4) {
              parsedHitPoints.d4 = amount;
            } else if (die === 6) {
              parsedHitPoints.d6 = amount;
            } else if (die === 8) {
              parsedHitPoints.d8 = amount;
            } else if (die === 10) {
              parsedHitPoints.d10 = amount;
            } else if (die === 12) {
              parsedHitPoints.d12 = amount;
            } else if (die === 20) {
              parsedHitPoints.d20 = amount;
            }
          }

          const modifierMatch = hitPointsText.match(
            /d(?:4|6|8|10|12|20)\s*([+-]\s*\d+)/i,
          );
          if (modifierMatch) {
            const parsedModifier = Number(modifierMatch[1].replace(/\s+/g, ""));
            if (Number.isFinite(parsedModifier)) {
              parsedHitPoints.modifier = parsedModifier;
            }
          }

          updatedMonster.hitPoints = parsedHitPoints;
        },
        monster,
      );

      this.parseSafely(
        "speed",
        () => {
          const speed = this.getStatText(document, "Speed");
          if (speed) {
            updatedMonster.speed = speed;
          }
        },
        monster,
      );

      this.parseSafely(
        "ability scores",
        () => {
          const abilityMap: Array<{
            heading: string;
            key:
              | "strength"
              | "dexterity"
              | "constitution"
              | "intelligence"
              | "wisdom"
              | "charisma";
          }> = [
            { heading: "STR", key: "strength" },
            { heading: "DEX", key: "dexterity" },
            { heading: "CON", key: "constitution" },
            { heading: "INT", key: "intelligence" },
            { heading: "WIS", key: "wisdom" },
            { heading: "CHA", key: "charisma" },
          ];

          for (const ability of abilityMap) {
            const valueText = this.getStatText(document, ability.heading);
            if (!valueText) {
              continue;
            }

            const valueMatch = valueText.match(/-?\d+/);
            if (!valueMatch) {
              continue;
            }

            const value = Number(valueMatch[0]);
            if (!Number.isFinite(value)) {
              continue;
            }

            updatedMonster[ability.key] = value;
          }
        },
        monster,
      );

      this.parseSafely(
        "saving throws",
        () => {
          const value = this.getStatText(document, "Saving Throws");
          const parsed = this.parseNamedBonuses(value);
          if (parsed.length > 0) {
            updatedMonster.savingThrows = parsed as Monster["savingThrows"];
          }
        },
        monster,
      );

      this.parseSafely(
        "skills",
        () => {
          const value = this.getStatText(document, "Skills");
          const parsed = this.parseNamedBonuses(value);
          if (parsed.length > 0) {
            updatedMonster.skills = parsed as Monster["skills"];
          }
        },
        monster,
      );

      this.parseSafely(
        "languages",
        () => {
          const languages = this.getStatText(document, "Languages");
          if (languages) {
            updatedMonster.languages = languages;
          }
        },
        monster,
      );

      this.parseSafely(
        "damage vulnerabilities",
        () => {
          const damageVulnerabilities = this.getStatText(
            document,
            "Damage Vulnerabilities",
          );
          if (damageVulnerabilities) {
            updatedMonster.damageVulnerabilities = damageVulnerabilities;
          }
        },
        monster,
      );

      this.parseSafely(
        "damage resistances",
        () => {
          const damageResistances = this.getStatText(
            document,
            "Damage Resistances",
          );
          if (damageResistances) {
            updatedMonster.damageResistances = damageResistances;
          }
        },
        monster,
      );

      this.parseSafely(
        "damage immunities",
        () => {
          const damageImmunities = this.getStatText(
            document,
            "Damage Immunities",
          );
          if (damageImmunities) {
            updatedMonster.damageImmunities = damageImmunities;
          }
        },
        monster,
      );

      this.parseSafely(
        "condition immunities",
        () => {
          const conditionImmunities = this.getStatText(
            document,
            "Condition Immunities",
          );
          if (conditionImmunities) {
            updatedMonster.conditionImmunities = conditionImmunities;
          }
        },
        monster,
      );

      this.parseSafely(
        "senses",
        () => {
          const senses = this.getStatText(document, "Senses");
          if (senses) {
            updatedMonster.senses = senses;
          }
        },
        monster,
      );

      this.parseSafely(
        "challenge rating",
        () => {
          const challengeText = this.getStatText(document, "Challenge");
          if (!challengeText) {
            return;
          }

          const challengeMatch = challengeText.match(/(\d+\/\d+|\d+)/);
          if (challengeMatch) {
            updatedMonster.challengeRating = challengeMatch[1];
          }
        },
        monster,
      );

      this.parseSafely(
        "traits",
        () => {
          const traits = this.parseTraitsFromTopMatter(document);
          if (traits.length > 0) {
            updatedMonster.traits = traits as Monster["traits"];
          }
        },
        monster,
      );

      this.parseSafely(
        "actions",
        () => {
          const actions = this.parseNamedEntriesInSection(document, "Actions");
          if (actions.length > 0) {
            updatedMonster.actions = actions as Monster["actions"];
          }
        },
        monster,
      );

      this.parseSafely(
        "legendary actions",
        () => {
          const legendaryAction = this.parseSpecialActionBlock(
            document,
            "Legendary Actions",
          );
          if (legendaryAction) {
            updatedMonster.legendaryAction =
              legendaryAction as Monster["legendaryAction"];
          }
        },
        monster,
      );

      this.parseSafely(
        "mystic actions",
        () => {
          const mysticAction = this.parseSpecialActionBlock(
            document,
            "Mythic Actions",
          );
          if (mysticAction) {
            updatedMonster.mysticAction =
              mysticAction as Monster["mysticAction"];
          }
        },
        monster,
      );

      this.parseSafely(
        "lair actions",
        () => {
          const lairAction = this.parseSpecialActionBlock(
            document,
            "Lair Actions",
          );
          if (lairAction) {
            updatedMonster.lairAction = lairAction as Monster["lairAction"];
          }
        },
        monster,
      );

      this.parseSafely(
        "psionics",
        () => {
          const psionics = this.parsePsionics(document);
          if (psionics) {
            updatedMonster.psionics = psionics;
          }
        },
        monster,
      );

      const listIndex = this.list.findIndex(
        (item) => item.link === monster.link && item.source === monster.source,
      );
      if (listIndex >= 0) {
        this.list[listIndex] = updatedMonster;
        return this.list[listIndex];
      }

      return updatedMonster;
    } catch (error: unknown) {
      console.error(`${this.LOG_PREFIX} Failed to update monster from link`, {
        link: monster.link,
        error,
      });
      return monster;
    }
  }

  //endregion

  //region Helpers

  private parseSafely(
    label: string,
    parseFn: () => void,
    monster: Pick<Monster, "name" | "link">,
  ): void {
    try {
      parseFn();
    } catch (error: unknown) {
      console.error(`${this.LOG_PREFIX} Failed parsing ${label}`, {
        monster: monster.name,
        link: monster.link,
        error,
      });
    }
  }

  private getStatText(
    document: Document,
    statLabel: string,
  ): string | undefined {
    const statHeading = Array.from(document.querySelectorAll("h4")).find(
      (heading) =>
        heading.textContent?.trim().toLowerCase() === statLabel.toLowerCase(),
    );

    if (!statHeading) {
      return undefined;
    }

    return this.collectTextUntil(statHeading.nextElementSibling, [
      "H1",
      "H2",
      "H3",
      "H4",
    ]);
  }

  private collectTextUntil(
    start: Element | null,
    stopTagNames: string[],
  ): string | undefined {
    const stopTags = new Set(stopTagNames.map((tag) => tag.toUpperCase()));
    const parts: string[] = [];

    let current: Element | null = start;
    while (current) {
      if (stopTags.has(current.tagName.toUpperCase())) {
        break;
      }

      const text = current.textContent?.replace(/\s+/g, " ").trim();
      if (text) {
        parts.push(text);
      }

      current = current.nextElementSibling;
    }

    if (parts.length === 0) {
      return undefined;
    }

    return parts.join(" ").trim();
  }

  private parseNamedBonuses(
    value?: string,
  ): Array<{ name: string; value: number }> {
    if (!value) {
      return [];
    }

    return value
      .split(",")
      .map((chunk) => chunk.trim())
      .map((chunk) => {
        const match = chunk.match(/^([A-Za-z\s]+)\s*([+-]\d+)$/);
        if (!match) {
          return undefined;
        }

        const name = match[1].trim();
        const parsedValue = Number(match[2]);
        if (!name || !Number.isFinite(parsedValue)) {
          return undefined;
        }

        return {
          name,
          value: parsedValue,
        };
      })
      .filter((entry): entry is { name: string; value: number } =>
        Boolean(entry),
      );
  }

  private parseTraitsFromTopMatter(
    document: Document,
  ): Array<{ name: string; description: string }> {
    const topStats = document.querySelector(".top-stats");

    if (!topStats) {
      return [];
    }

    const entries: Array<{ name: string; description: string }> = [];
    let current = topStats.nextElementSibling;

    while (current) {
      if (current.tagName.toUpperCase() === "H3") {
        break;
      }

      const text = current.textContent?.replace(/\s+/g, " ").trim();
      if (text) {
        const parsed = this.parseNamedEntry(text);
        if (parsed) {
          entries.push(parsed);
        }
      }

      current = current.nextElementSibling;
    }

    return entries;
  }

  private parseNamedEntriesInSection(
    document: Document,
    sectionTitle: string,
  ): Array<{ name: string; description: string }> {
    const sectionHeading = this.findSectionHeading(document, sectionTitle);
    if (!sectionHeading) {
      return [];
    }

    const entries: Array<{ name: string; description: string }> = [];
    let current = sectionHeading.nextElementSibling;

    while (current) {
      if (["H1", "H2", "H3"].includes(current.tagName.toUpperCase())) {
        break;
      }

      const text = current.textContent?.replace(/\s+/g, " ").trim();
      if (!text) {
        current = current.nextElementSibling;
        continue;
      }

      const parsed = this.parseNamedEntry(text);
      if (parsed) {
        entries.push(parsed);
      }

      current = current.nextElementSibling;
    }

    return entries;
  }

  private parseSpecialActionBlock(
    document: Document,
    sectionTitle: string,
  ):
    | {
        description: string;
        actions: Array<{ name?: string; description: string }>;
      }
    | undefined {
    const sectionHeading = this.findSectionHeading(document, sectionTitle);
    if (!sectionHeading) {
      return undefined;
    }

    let current = sectionHeading.nextElementSibling;
    const parts: string[] = [];
    const entries: Array<{ name?: string; description: string }> = [];

    while (current) {
      if (["H1", "H2", "H3"].includes(current.tagName.toUpperCase())) {
        break;
      }

      const text = current.textContent?.replace(/\s+/g, " ").trim();
      if (!text) {
        current = current.nextElementSibling;
        continue;
      }

      const parsedEntry = this.parseNamedEntry(text, 8, 60);
      if (parsedEntry) {
        entries.push(parsedEntry);
      } else {
        if (current.tagName.toUpperCase() === "UL") {
          // special case ul without names.
          const listItems = current.querySelectorAll("li");
          listItems.forEach((li) => {
            const liText = li.textContent?.replace(/\s+/g, " ").trim();
            if (liText) {
              entries.push({ name: undefined, description: liText });
            }
          });
        } else {
          parts.push(text);
        }
      }

      current = current.nextElementSibling;
    }

    if (parts.length === 0 && entries.length === 0) {
      return undefined;
    }

    return {
      description: parts.join(" ").trim(),
      actions: entries,
    };
  }

  private parsePsionics(
    document: Document,
  ): { charges: number; recharge: string; fracture: string } | undefined {
    const sectionHeading = this.findSectionHeading(document, "Psionics");
    if (!sectionHeading) {
      return undefined;
    }

    const sectionText = this.collectTextUntil(
      sectionHeading.nextElementSibling,
      ["H1", "H2", "H3"],
    );
    if (!sectionText) {
      return undefined;
    }

    const chargesMatch = sectionText.match(/Charges:\s*(\d+)/i);
    const rechargeMatch = sectionText.match(
      /Recharge:\s*(.+?)(?:\s*Fracture:|\s*\||$)/i,
    );
    const fractureMatch = sectionText.match(/Fracture:\s*(.+?)(?:\s*\||$)/i);

    if (!chargesMatch || !rechargeMatch || !fractureMatch) {
      return undefined;
    }

    const charges = Number(chargesMatch[1]);
    if (!Number.isFinite(charges)) {
      return undefined;
    }

    return {
      charges,
      recharge: rechargeMatch[1].trim(),
      fracture: fractureMatch[1].trim(),
    };
  }

  private parseNamedEntry(
    text: string,
    maxNameWords: number = 10,
    maxNameLength: number = 80,
  ): { name: string; description: string } | undefined {
    const namedEntryMatch = text.match(/^([^.]+)\.\s+(.+)$/);
    if (!namedEntryMatch) {
      return undefined;
    }

    const name = namedEntryMatch[1].trim();
    const description = namedEntryMatch[2].trim();
    if (!name || !description) {
      return undefined;
    }

    if (name.includes(",") || name.length > maxNameLength) {
      return undefined;
    }

    const nameWordCount = name.split(/\s+/).filter(Boolean).length;
    if (nameWordCount > maxNameWords) {
      return undefined;
    }

    return {
      name,
      description,
    };
  }

  private findSectionHeading(
    document: Document,
    sectionTitle: string,
  ): HTMLHeadingElement | undefined {
    const heading = Array.from(document.querySelectorAll("h3")).find(
      (node) =>
        node.textContent?.trim().toLowerCase() === sectionTitle.toLowerCase(),
    );

    return heading as HTMLHeadingElement | undefined;
  }

  //endregion
}
