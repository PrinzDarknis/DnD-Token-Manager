import { Component, ReactNode } from "react";

import "./settings-controller.css";

type Props = object;
interface State {
  index: number;
}

export class SettingsController extends Component<Props, State> {
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
        <div className="settings-controller"></div>
      </>
    );
  }
}
