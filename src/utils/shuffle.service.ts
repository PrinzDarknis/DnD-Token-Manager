export function shuffle<T = unknown[] | string>(field: T): T {
  const isArray = Array.isArray(field);
  const arr = isArray ? field : (field as string).split("");

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp: (typeof arr)[0] = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }

  return isArray ? (arr as T) : (arr.join("") as T);
}
