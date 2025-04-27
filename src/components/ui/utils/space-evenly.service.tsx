import { ReactNode } from "react";

import "./space-evenly.css";

export function spaceEvenly(
  elements: ReactNode[],
  rows: number = 1
): ReactNode {
  const keyRand = Math.random(); // unique keys for each instance
  const keyMap = (x: number, y: number) =>
    `spaceEvenly-${keyRand}-row-${x}-colum-${y}`;
  const splitPoint = Math.ceil(elements.length / rows);
  const field: ReactNode[][] = [];

  for (let idx = 0; idx < rows; idx++) {
    field.push([<span className="spacer" key={keyMap(0, idx)}></span>]);
  }

  for (const [idx, element] of elements.entries()) {
    const rowIdx = Math.floor(idx / splitPoint);
    field[rowIdx].push(
      element,
      <span className="spacer" key={keyMap(idx + 1, rowIdx)}></span>
    );
  }

  return (
    <div className="even-field">
      {field.map((row, idx) => (
        <div className="even-row" key={keyMap(-1, idx)}>
          {row}
        </div>
      ))}
    </div>
  );
}
