import { handlePr } from '@/github/templates';
import { ctx } from '../ctx';
import { pull_request_closed, pull_request_opened } from './examples';

describe.only('github templates pr or issue', () => {
  it('can handle pull_request_closed', async () => {
    const result = await handlePr(pull_request_closed, ctx);
    console.log(`🚀 ~ file: prOrIssue.test.ts ~ line 9 ~ it ~ result`, result);
    expect(result.text).toBeDefined();
    expect(result.title).toBeDefined();
  });
  it('can handle pull_request_opened', async () => {
    const result = await handlePr(pull_request_opened, ctx);
    console.log(
      `🚀 ~ file: prOrIssue.test.ts ~ line 14 ~ it ~ result`,
      result.text,
    );
    expect(result.text).toBeDefined();
    expect(result.text).toContain('<-');
    expect(result.title).toBeDefined();
  });
});
