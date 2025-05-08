export function goodTimeString(date: Date): string {
  const datePart = date.toISOString().split("T")[0];
  const timePart = date.toLocaleString().split(",")[1];
  return datePart + timePart;
}
