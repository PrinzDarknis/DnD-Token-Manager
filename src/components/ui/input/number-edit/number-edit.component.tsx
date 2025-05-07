import { Component, ReactNode } from "react";

import "./number-edit.css";

import { mathLimit } from "../../../../utils";
import { spaceEvenly } from "../../utils";

interface Props {
  steps: number[];
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
}

export class NumberEdit extends Component<Props> {
  // handler
  async modValue(mod: number): Promise<void> {
    const newValue = mathLimit(
      this.props.value + mod,
      this.props.min ?? Number.MIN_VALUE,
      this.props.max ?? Number.MAX_VALUE
    );
    this.props.onChange?.(newValue);
  }

  // render
  render(): ReactNode {
    const frontButtons: ReactNode[] = [];
    const backButtons: ReactNode[] = [];

    this.props.steps.forEach((step, idx) => {
      frontButtons.unshift(
        <span
          key={`number-edit-button-step-${-step}`}
          className="button"
          onClick={() => this.modValue(-step)}
        >
          {"<".repeat(idx + 1)}
        </span>
      );
      backButtons.push(
        <span
          key={`number-edit-button-step-${step}`}
          className="button"
          onClick={() => this.modValue(step)}
        >
          {">".repeat(idx + 1)}
        </span>
      );
    });

    return (
      <>
        <div className="number-edit">
          {spaceEvenly([
            ...frontButtons,
            <span key={`time-control-button-game-time`} className="value">
              {this.props.value}
            </span>,
            ...backButtons,
          ])}
        </div>
      </>
    );
  }
}
