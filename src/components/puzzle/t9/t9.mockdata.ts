import { T9PuzzleInfo } from "./t9.component";

export const T9_EXAMPLE: T9PuzzleInfo = {
  master: "XXX",
  processing: false,
  puzzle: "T9",
  saveName: "Temp T9",
  visableName: "Test Puzzle T9",
  config: {
    code: {
      "★": ["␣", "A", "B"],
      "🐾": ["C", "D", "E"],
      "☀": ["F", "G", "H"],
      "♂": ["I", "J", "K"],
      "⚥": ["L", "M", "N"],
      "♀": ["O", "P", "Q"],
      "🍑": ["R", "S", "T"],
      "☿": ["U", "V", "W"],
      "🍆": ["X", "Y", "Z"],
    },
  },
  state: {
    playerReadable: [[], [], [], [], [], [], [], [], []],
  },
};
