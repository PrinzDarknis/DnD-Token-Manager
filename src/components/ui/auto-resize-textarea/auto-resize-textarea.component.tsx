import React, { Component, ReactNode } from "react";

import "./auto-resize-textarea.css";

interface Props extends React.InputHTMLAttributes<HTMLTextAreaElement> {
  value: string | number | readonly string[];
}

export class AutoResizeTextarea extends Component<Props> {
  private textarea?: HTMLTextAreaElement | null;

  onInput() {
    if (this.textarea) {
      this.textarea.style.height = "auto";
      this.textarea.style.height = this.textarea.scrollHeight + "px";
    }
  }

  render(): ReactNode {
    return (
      <>
        <textarea
          ref={(el) => {
            this.textarea = el;
          }}
          {...this.props}
          className={`auto-resize-textarea ${this.props.className}`}
          value={this.props.value}
          style={{
            height: this.textarea
              ? this.textarea.scrollHeight + "px"
              : undefined,
          }}
          onInput={(e) => {
            this.onInput();
            this.props.onInput?.(e);
          }}
        />
      </>
    );
  }

  componentDidUpdate(): void {
    this.onInput();
  }
}
