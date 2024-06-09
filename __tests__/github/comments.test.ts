import { CommentBody } from '@/github/templates/comment';

describe('comment', () => {
  it('renderCommentBody', () => {
    const d = CommentBody({
      body: `# [Codecov](https://codecov.io/gh/opensumi/core/pull/466?src=pr&el=h1&utm_medium=referral&utm_source=github&utm_content=comment&utm_campaign=pr+comments&utm_term=opensumi) Report
> Merging [#466](https://codecov.io/gh/opensumi/core/pull/466?src=pr&el=desc&utm_medium=referral&utm_source=github&utm_content=comment&utm_campaign=pr+comments&utm_term=opensumi) (5aeef71) into [main](https://codecov.io/gh/opensumi/core/commit/f3c09bbed6a9db6737bb4f93adcce4aae3e3ff85?el=desc&utm_medium=referral&utm_source=github&utm_content=comment&utm_campaign=pr+comments&utm_term=opensumi) (f3c09bb) will **increase** coverage by \`0.00%\`.
> The diff coverage is \`0.00%\`.


[![Impacted file tree graph](https://codecov.io/gh/opensumi/core/pull/466/graphs/tree.svg?width=650&height=150&src=pr&token=07JAPLU957&utm_medium=referral&utm_source=github&utm_content=comment&utm_campaign=pr+comments&utm_term=opensumi)](https://codecov.io/gh/opensumi/core/pull/466?src=pr&el=tree&utm_medium=referral&utm_source=github&utm_content=comment&utm_campaign=pr+comments&utm_term=opensumi)`,
      user: { login: 'codecov-commenter' },
    });
    console.log(`🚀 ~ file: comments.test.ts ~ line 21 ~ d`, d);
    expect(d.split('\n')).toMatchInlineSnapshot(`
      [
        "Merging [#466](https://codecov.io/gh/opensumi/core/pull/466?src=pr&el=desc&utm_medium=referral&utm_source=github&utm_content=comment&utm_campaign=pr+comments&utm_term=opensumi) (5aeef71) into [main](https://codecov.io/gh/opensumi/core/commit/f3c09bbed6a9db6737bb4f93adcce4aae3e3ff85?el=desc&utm_medium=referral&utm_source=github&utm_content=comment&utm_campaign=pr+comments&utm_term=opensumi) (f3c09bb) will **increase** coverage by \`0.00%\`.",
        "The diff coverage is \`0.00%\`.",
      ]
    `);
  });
  it('render comment with number', () => {
    const d = CommentBody({
      body: `123123`,
      user: { login: 'hello' },
    });
    expect(d.trim().split('\n')).toMatchInlineSnapshot(`
      [
        "123123",
      ]
    `);
  });
});
