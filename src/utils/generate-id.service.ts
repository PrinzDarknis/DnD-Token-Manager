export function generateID(type: string, oldIDs: string[]): string {
  let id: string;
  do {
    const uniqueSuffix = Math.random().toString(16).slice(2);
    id = `${type}-${uniqueSuffix}`;
  } while (oldIDs.includes(id));
  return id;
}
