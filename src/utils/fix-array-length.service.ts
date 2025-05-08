/**
 * Changes the Length of an array to a fix size
 * @param array Array to change
 * @param targetLength Length to change to
 * @param getfillValue Function returning an Value to fill newe Entries with. (callback to avoid inserting the same array (referenz) multiple times)
 * @returns Array of removed Values
 */
export function fixArrayLength<T>(
  array: T[],
  targetLength: number,
  getfillValue: () => T
): T[] {
  const deletedArr: T[] = [];
  while (targetLength > array.length) {
    array.push(getfillValue());
  }
  while (targetLength < array.length) {
    const deleted = array.pop();
    if (deleted) deletedArr.push(deleted);
  }
  return deletedArr;
}
