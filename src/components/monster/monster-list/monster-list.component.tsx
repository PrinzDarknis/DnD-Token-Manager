import { Component, ReactNode } from "react";

import { Monster, MonsterManager } from "../../../model";
import { MonsterView } from "../monster-view";

import "./monster-list.css";

interface Props {
  monsters: Monster[];
  onMonsterNameClick?: (monster: Monster) => void;
}
type SortColumn = "name" | "challengeRating" | "type";

interface State {
  sortColumn: SortColumn;
  sortDirection: "asc" | "desc";
  selected?: Monster;
}

export class MonsterList extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      sortColumn: "name",
      sortDirection: "asc",
    };
  }

  async componentDidMount(): Promise<void> {}

  // State
  async setStatePromise(state: State): Promise<void> {
    return new Promise<void>((resolve) => this.setState(state, resolve));
  }

  async setSelected(monster: Monster | undefined): Promise<void> {
    await this.setStatePromise({ ...this.state, selected: monster });
  }

  // handler
  onSortClick(column: SortColumn): void {
    this.setState((prevState) => {
      if (prevState.sortColumn === column) {
        return {
          sortColumn: column,
          sortDirection: prevState.sortDirection === "asc" ? "desc" : "asc",
        };
      }

      return {
        sortColumn: column,
        sortDirection: "asc",
      };
    });
  }

  onMonsterNameClick(monster: Monster): void {
    if (this.props.onMonsterNameClick) {
      this.props.onMonsterNameClick?.(monster);
      return;
    }

    this.setSelected(monster);
  }

  getSortedMonsters(): Monster[] {
    const { monsters } = this.props;
    const { sortColumn, sortDirection } = this.state;

    const sortedMonsters = [...monsters].sort((a, b) => {
      if (sortColumn === "challengeRating") {
        const aRating = MonsterManager.parseChallengeRating(a.challengeRating);
        const bRating = MonsterManager.parseChallengeRating(b.challengeRating);

        return aRating - bRating;
      }

      const aValue = (a[sortColumn] ?? "").toString();
      const bValue = (b[sortColumn] ?? "").toString();

      return aValue.localeCompare(bValue, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });

    if (sortDirection === "desc") {
      sortedMonsters.reverse();
    }

    return sortedMonsters;
  }

  getSortIndicator(column: SortColumn): string {
    if (this.state.sortColumn !== column) {
      return "";
    }

    return this.state.sortDirection === "asc" ? " ▲" : " ▼";
  }

  //region Render

  render(): ReactNode {
    if (this.state.selected) return this.renderMonster();
    return this.renderList();
  }

  private renderList(): ReactNode {
    const sortedMonsters = this.getSortedMonsters();

    return (
      <>
        <div className="monster-list">
          <table className="monster-list-table">
            <thead>
              <tr>
                <th onClick={() => this.onSortClick("name")}>
                  Name{this.getSortIndicator("name")}
                </th>
                <th onClick={() => this.onSortClick("challengeRating")}>
                  Challenge Rating{this.getSortIndicator("challengeRating")}
                </th>
                <th onClick={() => this.onSortClick("type")}>
                  Type{this.getSortIndicator("type")}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedMonsters.map((monster) => (
                <tr key={monster.link || `${monster.source}-${monster.name}`}>
                  <td>
                    <button
                      className="monster-list-name-button"
                      onClick={() => this.onMonsterNameClick(monster)}
                    >
                      {monster.name}
                    </button>
                  </td>
                  <td>{monster.challengeRating ?? "-"}</td>
                  <td>{monster.type ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  private renderMonster(): ReactNode {
    return (
      <>
        <MonsterView
          monster={this.state.selected!}
          onClose={() => this.setSelected(undefined)}
        />
      </>
    );
  }

  //endregion
}
