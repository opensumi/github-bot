import {
  handleCommitComment,
  handleIssueComment,
} from '@/services/github/templates/comment';
import {
  commit_comment_611372_0_created,
  issue_comment_1_0_created,
  issue_comment_created,
} from '../../fixtures';
import { ctx } from '../ctx';

describe('github templates comment', () => {
  it('can handle commit_comment', async () => {
    const result = await handleCommitComment(
      commit_comment_611372_0_created,
      ctx,
    );
    console.log(`commit_comment ~ result`, result);
    expect(result).toMatchSnapshot();
    expect(result.text).toBeDefined();
    expect(result.title).toBeDefined();
  });
  it('can handle issue comment', async () => {
    const result = await handleIssueComment(issue_comment_1_0_created, ctx);
    console.log(`issue_comment ~ result`, result);
    expect(result).toMatchSnapshot();
    expect(result.text).toBeDefined();
    expect(result.title).toBeDefined();
  });

  it('can handle issue comment created', async () => {
    const result = await handleIssueComment(issue_comment_created, ctx);
    console.log(`issue_comment ~ result`, result);
    expect(result).toMatchSnapshot();
    expect(result.text).toBeDefined();
    expect(result.title).toBeDefined();
  });
});
