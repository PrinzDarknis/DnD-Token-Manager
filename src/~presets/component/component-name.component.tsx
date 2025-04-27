import { Component, ReactNode } from "react";

import "./component-name.css";

type Props = object;
type State = object;

export class ComponentName extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  async componentDidMount(): Promise<void> {}

  // State
  async setStatePromise(state: State): Promise<void> {
    return new Promise<void>((resolve) => this.setState(state, resolve));
  }

  // handler
  async onSomeThing(): Promise<void> {}

  // render
  render(): ReactNode {
    return (
      <>
        <div className="component-name"></div>
      </>
    );
  }
}
