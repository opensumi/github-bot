import { handleReviewComment } from '@/github/templates/comment';
import { handleReview } from '@/github/templates/review';

import {
  pull_request_2_review_comment_0_created,
  pull_request_review_2_1_dismissed_dismissed,
  review_comment_created,
} from '../../fixtures';
import { ctx } from '../ctx';

describe('github templates pr review', () => {
  it('can handle pull_request_review_comment_0_created', async () => {
    const result = await handleReviewComment(
      pull_request_2_review_comment_0_created,
      ctx,
    );
    console.log(`pull_request_review_comment_0_created ~ result`, result);
    expect(result).toMatchSnapshot();
  });
  it('can handle complex code review', async () => {
    const result = await handleReviewComment(review_comment_created, ctx);
    console.log(`review_comment_created ~ result`, result);
    expect(result).toMatchSnapshot();
  });
  it('can handle pull_request_review_2_1_dismissed_dismissed', async () => {
    const result = await handleReview(
      pull_request_review_2_1_dismissed_dismissed,
      ctx,
    );
    console.log(`pull_request_review_2_1_dismissed_dismissed ~ result`, result);
    expect(result).toMatchSnapshot();
  });
});
