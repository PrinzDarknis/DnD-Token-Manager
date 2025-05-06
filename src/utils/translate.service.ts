import { Log } from "./logging";

/**
 * Translates a text from a source alphabet into a target alphabet. Supports double chars.
 * @param text Text to translate
 * @param source Source Alphabet
 * @param target Target Alphabet
 * @param noError If set, not Error will be logged. E.g. for Input validation.
 * @returns translated text
 */
export function translate(
  text: string,
  source: string[],
  target: string[],
  noError: boolean = false
): string {
  let translatedText = "";
  for (let idx = 0; idx < text.length; idx++) {
    let char = text[idx];
    let charIdx = source.indexOf(char);

    if (charIdx == -1) {
      // check for double Char
      char += text[++idx];
      charIdx = source.indexOf(char);

      if (charIdx == -1) {
        if (!noError)
          Log.error("translate", "unkown char while translating", {
            idx: idx - 1, //old index
            char: char[0], // old char
            doubleChar: char,
            text,
            source,
            target,
          });
        return translatedText;
      }
    }

    translatedText += target[charIdx];
  }
  return translatedText;
}
