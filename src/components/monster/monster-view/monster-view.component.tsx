import { Component, ReactNode } from "react";

import { Monster } from "../../../model";
import { ImgButton } from "../../ui";

import closeImg from "/icons/failed.svg";
import targetImg from "/icons/target.svg";

import "./monster-view.css";

interface Props {
  monster: Monster;
  onClose?: () => void;
}
type State = object;

export class MonsterView extends Component<Props, State> {
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
  async placeMonster(): Promise<void> {
    console.log("Placing monster:", this.props.monster);
  }

  // render
  render(): ReactNode {
    return (
      <>
        <div className="monster-view">
          <div className="actions">
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
          {this.props.monster.name}
        </div>
      </>
    );
  }
}
