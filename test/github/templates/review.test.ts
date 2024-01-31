import { handleReviewComment } from '@/github/templates/comment';

import { pull_request_review_comment_0_created } from '../../fixtures';
import { ctx } from '../ctx';

describe('github templates pr review', () => {
  it('can handle pull_request_closed', async () => {
    const result = await handleReviewComment(
      pull_request_review_comment_0_created,
      ctx,
    );
    console.log(`pull_request_closed ~ result`, result);
    expect(result).toMatchSnapshot();
  });
});
