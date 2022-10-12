const COMMENTS_START = '<!--';
const COMMENTS_END = '-->';

const parsePayload = (body: string) => {
  const lines = body.split('\n');
  const result = {} as Record<string, string>;
  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    if (line) {
      let text = line.trim();
      if (text.startsWith(COMMENTS_START) && text.endsWith(COMMENTS_END)) {
        text = text
          .substring(COMMENTS_START.length, text.length - COMMENTS_END.length)
          .trim();
        const [left, right] = text.split(':');
        if (left && right) {
          result[left.trim()] = right.trim();
        }
      }
    }
  }

  return result;
};

export const parseCommandInMarkdownComments = (body: string) => {
  const payload = parsePayload(body);
  if (Object.keys(payload).length === 0) {
    return undefined;
  }
  return payload;
};
