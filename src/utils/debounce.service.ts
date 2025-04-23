const debounceHolder: { [key: string]: number } = {};

export function debounce(
  key: string,
  execution: () => void,
  timeout: number = 500
) {
  const oldId = debounceHolder[key];
  if (oldId) clearTimeout(oldId);

  debounceHolder[key] = setTimeout(execution, timeout);
}
