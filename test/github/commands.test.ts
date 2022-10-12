import { parseCommandInMarkdownComments } from '@/github/commands/parse';

describe('command related', () => {
  it('can parse command in markdown comments', () => {
    const text = '<!-- versionInfo: RC | 2.20.5-rc-1665562305.0 -->';
    const v = parseCommandInMarkdownComments(text);
    console.log(`🚀 ~ file: commands.test.ts ~ line 7 ~ it ~ v`, v);
    expect(v).toBeDefined();
  });
});
