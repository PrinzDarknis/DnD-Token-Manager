import { Component, ReactNode } from "react";

import "./multi-pick.css";

import { cssClass, fixTooltipPosition } from "../../../../utils";

import { spaceEvenly } from "../../utils";

interface Props<T> {
  value: T[];
  options: T[];
  alias?: string[];
  onChange: (newValues: T[]) => void;
}

export class MultiPick<
  T extends { toString: () => string } = string
> extends Component<Props<T>> {
  // handler
  async onChnage(valueIdx: number): Promise<void> {
    const values = [...this.props.value];
    const changedValue = this.options[valueIdx];
    const idx = values.indexOf(changedValue);
    if (idx == -1) values.push(changedValue);
    else values.splice(idx, 1);
    this.props.onChange(values);
  }

  private isSelected(idx: number): boolean {
    const option = this.options[idx];
    return this.props.value.includes(option);
  }

  private options: T[] = [];
  private selectorElement?: HTMLDivElement | null;

  // render
  render(): ReactNode {
    // make sure the selected values are included
    const additionalOptions = [];
    for (const selectedOption of this.props.value) {
      if (!this.props.options.includes(selectedOption))
        additionalOptions.push(selectedOption);
    }
    this.options = [...additionalOptions, ...this.props.options];

    return (
      <>
        <div
          className="multi-pick"
          onMouseOver={(e) =>
            fixTooltipPosition(e.currentTarget, this.selectorElement)
          }
        >
          <div className="show-selection">{this.props.value.join(", ")}</div>
          <div
            className="selector"
            ref={(e) => {
              this.selectorElement = e;
            }}
          >
            {spaceEvenly(
              this.options.map((option, idx) => (
                <div
                  key={`multi-pick-option-${idx}`}
                  className={cssClass({
                    "multi-pick-option": true,
                    selected: this.isSelected(idx),
                  })}
                  onClick={() => this.onChnage(idx)}
                >
                  {this.props.alias?.[idx] ?? option.toString()}
                </div>
              )),
              Math.ceil(this.options.length / 4),
              "multi-pick-selector"
            )}
          </div>
          {}
        </div>
      </>
    );
  }
}
