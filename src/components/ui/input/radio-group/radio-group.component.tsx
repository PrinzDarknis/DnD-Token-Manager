import { Component, ReactNode } from "react";

import "./radio-group.css";
import { spaceEvenly } from "../../utils";

interface Props<T> {
  groupName: string;
  value: T;
  options: T[];
  alias?: string[];
  onChange: (newValue: T) => void;
  optionsPerRow?: number;
}

export class RadioGroup<
  T extends { toString: () => string } = string
> extends Component<Props<T>> {
  // handler
  async onChnage(checked: boolean, value: number): Promise<void> {
    if (!checked) return;

    const newValue = this.props.options[value as number];
    this.props.onChange(newValue);
  }

  // render
  render(): ReactNode {
    const valueIdx = this.props.options.indexOf(this.props.value);
    return (
      <>
        <div className="radio-group">
          {spaceEvenly(
            this.props.options.map((option, idx) => (
              <label
                key={`radio-group-${this.props.groupName}-option-${idx}`}
                htmlFor={`radio-group-${this.props.groupName}-option-${idx}`}
              >
                <input
                  type="radio"
                  value={idx}
                  name={this.props.groupName}
                  id={`radio-group-${this.props.groupName}-option-${idx}`}
                  checked={idx == valueIdx}
                  onChange={(e) =>
                    this.onChnage(e.target.checked, Number(e.target.value))
                  }
                />
                <span className="lable">
                  {this.props.alias?.[idx] ?? option.toString()}
                </span>
              </label>
            )),
            Math.ceil(
              this.props.options.length / (this.props.optionsPerRow ?? 3)
            ),
            `radio-group-${this.props.groupName}`
          )}
        </div>
      </>
    );
  }
}
