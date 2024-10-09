export function firstLine(text: string): string {
  const lines = text.split('\n');
  if (lines.length === 1) {
    return lines[0];
  } else {
    return `${lines[0]}...`;
  }
}
