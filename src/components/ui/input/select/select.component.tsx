import { Component, ReactNode } from "react";

import "./select.css";

interface Props<T> {
  value: T;
  options: T[];
  alias?: string[];
  onChange: (newValue: T) => void;
}

export class Select<
  T extends { toString: () => string } = string
> extends Component<Props<T>> {
  // handler
  async onChnage(value: number): Promise<void> {
    const newValue = this.props.options[value as number];
    this.props.onChange(newValue);
  }

  // render
  render(): ReactNode {
    return (
      <>
        <select
          className="select"
          value={this.props.options.indexOf(this.props.value)}
          onChange={(e) => this.onChnage(Number(e.target.value))}
        >
          {this.props.options.map((option, idx) => (
            <option key={`select-option-${idx}`} value={idx}>
              {this.props.alias?.[idx] ?? option.toString()}
            </option>
          ))}
        </select>
      </>
    );
  }
}
