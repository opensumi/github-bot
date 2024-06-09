import { parseCommandInMarkdownComments } from '@/github/commands/parse';
import { extractTargetBranchNameFromCommand } from '@/github/commands/pullRequests';

describe('command related', () => {
  it('can parse command in markdown comments', () => {
    const text = '<!-- versionInfo: RC | 2.20.5-rc-1665562305.0 -->';
    const v = parseCommandInMarkdownComments(text);
    console.log(`🚀 ~ file: commands.test.ts ~ line 7 ~ it ~ v`, v);
    expect(v).toBeDefined();
  });

  it('can extract backport command info', () => {
    const text = 'backport to v2.23';
    const v = extractTargetBranchNameFromCommand(text);
    expect(v).toBe('v2.23');

    const text2 = 'backport to v2.23 ';
    const v2 = extractTargetBranchNameFromCommand(text2);
    expect(v2).toBe('v2.23');

    const text3 = 'backport v2.23\n';
    const v3 = extractTargetBranchNameFromCommand(text3);
    console.log(`🚀 ~ file: commands.test.ts:23 ~ it ~ v3:`, v3);
    expect(v3).toBe('v2.23');

    const text4 = 'backport  v2.23';
    const v4 = extractTargetBranchNameFromCommand(text4);
    console.log(`🚀 ~ file: commands.test.ts:23 ~ it ~ v4:`, v4);
    expect(v4).toBe('v2.23');
  });
});
