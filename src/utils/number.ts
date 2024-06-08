export function parseValidNumber(value: string): number | undefined {
  const n = parseInt(value, 10);
  if (isNaN(n)) {
    return undefined;
  }
  return n;
}
