import { Component, ReactNode } from "react";

import "./tab-manager.css";

import { cssClass } from "../../../utils";

interface Props {
  tabs: Tab[];
}
interface State {
  index: number;
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
    };
  }

  async componentDidMount(): Promise<void> {}

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

  // handler

  // render
  render(): ReactNode {
    return (
      <>
        <div className="tab-manager">
          <div className="tab-selector">
            {this.props.tabs.map((tab, idx) => (
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
            {this.props.tabs.map((tab, idx) => (
              <div
                className={cssClass({
                  "tab-content": true,
                  left: idx < this.index,
                  center: idx == this.index,
                  rigth: idx > this.index,
                })}
                key={`tab-content-${tab.name}`}
              >
                {tab.content}
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }
}
