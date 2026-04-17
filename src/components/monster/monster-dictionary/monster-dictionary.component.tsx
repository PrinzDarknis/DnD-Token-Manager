import { Component, ReactNode } from "react";

import { Monster, MonsterManager } from "../../../model";

import { MonsterList } from "../monster-list";

import "./monster-dictionary.css";

type Props = object;
interface State {
  monsters: Monster[];
  loading: boolean;
}

export class MonsterDictionary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      monsters: [],
      loading: true,
    };

    MonsterManager.getMonsters().then((monsters) =>
      this.setMonsters(Object.values(monsters)),
    );
    MonsterManager.onUpdate((monsters) =>
      this.setMonsters(Object.values(monsters)),
    );
  }

  async componentDidMount(): Promise<void> {}

  // State
  async setStatePromise(state: State): Promise<void> {
    return new Promise<void>((resolve) => this.setState(state, resolve));
  }

  setMonsters(monsters: Monster[]): void {
    this.setState({ ...this.state, monsters, loading: false });
  }

  // handler

  // render
  render(): ReactNode {
    return (
      <>
        <div className="monster-dictionary">
          <div className="monster-dictionary-title">Monster Dictionary</div>
          <MonsterList monsters={this.state.monsters} />
        </div>
      </>
    );
  }
}
