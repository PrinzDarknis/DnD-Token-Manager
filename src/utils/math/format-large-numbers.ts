export function formatLargeNumber(num: number): string {
  if (typeof num !== "number" || !Number.isFinite(num)) {
    return String(num);
  }
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
