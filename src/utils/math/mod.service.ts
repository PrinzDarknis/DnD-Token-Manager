export function mod(n: number, modBy: number): number {
  return ((n % modBy) + modBy) % modBy;
}
