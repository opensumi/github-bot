export function removeCommandPrefix(text: string, command: string) {
  return text.trim().replace(new RegExp(`^${command}\\s*`), '');
}
