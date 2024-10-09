export function saftParseInt(value: string, radix = 10): number | undefined {
  const n = parseInt(value, radix);
  if (isNaN(n)) {
    return undefined;
  }
  return n;
}
