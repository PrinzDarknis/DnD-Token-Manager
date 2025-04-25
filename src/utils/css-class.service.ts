/**
 * Converts an Object with conditional css classNames to a single className string
 * @param classesObj Object with conditional css classNames
 * @returns className string
 */
export function cssClass(classesObj: { [className: string]: boolean }): string {
  return Object.entries(classesObj)
    .map(([className, condition]) => (condition ? className : ""))
    .join(" ");
}
