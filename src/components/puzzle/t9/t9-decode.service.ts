import { Log, translate } from "../../../utils";

import { IT9 } from "./t9.interface";

export function t9Code(text: string, t9: IT9): string {
  text = text.toUpperCase().replace(" ", "␣");
  let codedText = "";
  for (let idx = 0; idx < text.length; idx++) {
    let char = text[idx];
    let codedChar = t9CodeChar(char, t9);

    if (codedChar === false) {
      // check for double Char
      char += text[++idx];
      codedChar = t9CodeChar(char, t9);

      if (codedChar === false) {
        Log.error("t9Code", "unkown char while coding", {
          idx: idx - 1, //old index
          char: char[0], // old char
          doubleChar: char,
          text,
          t9,
        });
        return codedText;
      }
    }

    codedText += codedChar;
  }
  return codedText;
}

function t9CodeChar(char: string, t9: IT9): string | false {
  for (const [symbol, letters] of Object.entries(t9)) {
    const letterIdx = letters.indexOf(char);
    if (letterIdx > -1) return repeatChar(symbol, letterIdx + 1);
  }
  return false;
}

function repeatChar(char: string, n: number): string {
  let text = "";
  for (let idx = 0; idx < n; idx++) {
    text += char;
  }
  return text;
}

export function t9Decode(
  text: string,
  t9: IT9,
  inclPermutations: boolean = true
): string[] {
  const valideSymbols = Object.keys(t9);
  let translatedTextPermutations = [""];
  for (let idx = 0; idx < text.length; idx++) {
    let char = text[idx];
    const doubleChar = !valideSymbols.includes(char);
    if (doubleChar) {
      char += text[++idx];
      if (!valideSymbols.includes(char)) {
        Log.error("t9Decode", "unkown char while translating", {
          idx: idx - 1, //old index
          char: char[0], // old char
          doubleChar: char,
          text,
          t9,
        });
        return translatedTextPermutations;
      }
    }

    const letters = t9[char];
    let recurrence = 0;
    let nextChar: string;
    do {
      recurrence++;
      nextChar = doubleChar ? text[idx + 1] + text[idx + 2] : text[idx + 1];
      if (nextChar == char) idx += doubleChar ? 2 : 1; // correct idx
    } while (nextChar == char);

    const decodedPermutations = createPermutations(
      recurrence,
      letters,
      inclPermutations
    );
    translatedTextPermutations = appandAllPermutaions(
      translatedTextPermutations,
      decodedPermutations
    );
  }
  return translatedTextPermutations.map((t) => t.replace("␣", " "));
}

function appandAllPermutaions(
  permutations: string[],
  textsToAppend: string[]
): string[] {
  return permutations.reduce((prev, text) => {
    prev.push(...textsToAppend.map((append) => text + append));
    return prev;
  }, [] as string[]);
}

function createPermutations(
  recurrence: number,
  letters: string[],
  inclPermutations: boolean
): string[] {
  const permutations: string[] = [];

  if (recurrence <= 0) {
    return [""]; // exit condition
  }

  if (recurrence == 1 || (inclPermutations && recurrence > 1)) {
    const char = letters[0];
    const nextPermutations = createPermutations(
      recurrence - 1,
      letters,
      inclPermutations
    );
    permutations.push(...appandAllPermutaions([char], nextPermutations));
  }

  if (recurrence == 2 || (inclPermutations && recurrence > 2)) {
    const char = letters[1];
    const nextPermutations = createPermutations(
      recurrence - 2,
      letters,
      inclPermutations
    );
    permutations.push(...appandAllPermutaions([char], nextPermutations));
  }

  if (recurrence >= 3) {
    const char = letters[2];
    const nextPermutations = createPermutations(
      recurrence - 3,
      letters,
      inclPermutations
    );
    permutations.push(...appandAllPermutaions([char], nextPermutations));
  }

  return permutations;
}

export function t9IsValideCode(code: string, t9: IT9): boolean {
  const symbols = Object.keys(t9);
  const valideCodePart = translate(code, symbols, symbols, true); // translate from symbol code in the same. If no error the result should be the same.
  return valideCodePart == code;
}
