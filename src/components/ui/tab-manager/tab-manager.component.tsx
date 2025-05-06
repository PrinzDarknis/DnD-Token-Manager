import React, { Component, ReactNode } from "react";

import "./tab-manager.css";

import { cssClass } from "../../../utils";

interface Props {
  tabs: Tab[];
  gmTabs: Tab[];
  gm: boolean | Promise<boolean>;
}
interface State {
  index: number;
  gm: boolean;
}
interface Tab {
  name: string;
  content: ReactNode;
}

export class TabManager extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      index: 0,
      gm: false,
    };
  }

  async componentDidMount(): Promise<void> {
    await this.setGm(await this.props.gm);
  }

  // State
  async setStatePromise(state: State): Promise<void> {
    return new Promise<void>((resolve) => this.setState(state, resolve));
  }

  get index(): number {
    return this.state.index;
  }
  async setIndex(index: number): Promise<void> {
    await this.setState({ ...this.state, index });
  }

  get gm(): boolean {
    return this.state.gm;
  }
  async setGm(gm: boolean): Promise<void> {
    await this.setState({ ...this.state, gm });
  }

  // handler

  // render
  render(): ReactNode {
    const tabs = [...this.props.tabs, ...(this.gm ? this.props.gmTabs : [])];
    return (
      <>
        <div className="tab-manager">
          <div className="tab-selector">
            {tabs.map((tab, idx) => (
              <div
                className={cssClass({
                  "tab-header": true,
                  selected: idx == this.index,
                })}
                key={`tab-header-${tab.name}`}
                onClick={() => this.setIndex(idx)}
              >
                {tab.name}
              </div>
            ))}
          </div>
          <div className="tab-area">
            {tabs.map((tab, idx) => (
              <div
                className={cssClass({
                  "tab-content": true,
                  left: idx < this.index,
                  center: idx == this.index,
                  rigth: idx > this.index,
                })}
                key={`tab-content-${tab.name}`}
              >
                {React.cloneElement(tab.content as never, { gm: this.gm })}
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }
}
