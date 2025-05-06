import { Component, ReactNode } from "react";

import "./tooltip.css";

interface Props {
  children: ReactNode;
  tooltip: string;
}

export class Tooltip extends Component<Props> {
  render(): ReactNode {
    return (
      <>
        <div className="tooltip">
          {this.props.children}
          <span className="tooltiptext">{this.props.tooltip}</span>
        </div>
      </>
    );
  }
}
