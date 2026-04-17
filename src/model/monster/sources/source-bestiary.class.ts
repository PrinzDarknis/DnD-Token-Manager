import { Monster } from "../monster.interface";
import { MonsterSource } from "./monster-source.class";

export class SourceBestiary extends MonsterSource {
  protected readonly LIST_URL = "https://5ecompendium.github.io/bestiary/cr";
  protected readonly SOURCE_NAME = "Bestiary";

  // List
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

  // Single Monster
  protected async _updateMonster(monster: Monster): Promise<Monster> {
    if (monster.source !== this.SOURCE_NAME) {
      throw new Error(
        `Monster source mismatch: expected "${this.SOURCE_NAME}", got "${monster.source}"`,
      );
    }
  }
}
