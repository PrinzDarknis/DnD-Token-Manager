import { shuffle } from "../../utils";

export const SYMBOLS = [
  "☀",
  "★",
  "☘",
  "☙",
  "☥",
  "☣",
  "☸",
  "☿",
  "♁",
  "♂",
  "♀",
  "♅",
  "♆",
  "♨",
  "♾",
  "⚚",
  "⚘",
  "⚥",
  "⛬",
  "🕊",
  "🕱",
  "🛊",
  "🛏",
  "🜭",
  "🍑",
  "🍆",
  "🐾",
]; // one string not possible, because some symbols are longer than 1 char

export const ALPHABET = [
  "␣",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

export const CODED_ALPHABET = shuffle(SYMBOLS.slice(0, 27));
