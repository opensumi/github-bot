import path from 'path';
import { readFile } from 'fs/promises';

import { convertToDingMarkdown } from '@/github/dingtalk';
import { replaceGitHubText } from '@/github/gfm';
import { makeMarkdown, parseMarkdown } from '@/github/renderer/make-mark';

describe('github renderer make-mark', () => {
  it('parse and make', async () => {
    const md = await readFile(path.join(__dirname, './gfm.md'), 'utf-8');
    const parsed = parseMarkdown(md);
    const made = makeMarkdown(parsed);
    expect(made).toMatchSnapshot();
  });
  it('parse and make with code', async () => {
    let md = await readFile(
      path.join(__dirname, './review_comment_created.md'),
      'utf-8',
    );

    md = replaceGitHubText(md);
    const parsed = parseMarkdown(md);
    const made = makeMarkdown(parsed);
    expect(made).toMatchSnapshot();
  });

  it('convertToDingMarkdown', async () => {
    const md = await readFile(
      path.join(__dirname, './review_comment_created.md'),
      'utf-8',
    );
    const made = convertToDingMarkdown('', md);
    expect(made.markdown.text).toMatchSnapshot('convertToDingMarkdown');
  });
});
