import { StringBuilder } from '@/utils';
import {
  renderRepoLink,
  renderUserLink,
  StopHandleError,
  useRef,
  titleTpl,
  renderPrOrIssue,
} from '.';
import { Context } from '../app';
import { ExtractPayload, MarkdownContent } from '../types';

export async function handleReview(
  payload: ExtractPayload<'pull_request_review'>,
  ctx: Context,
): Promise<MarkdownContent> {
  const review = payload.review;
  let action = payload.action as string;
  const pr = payload.pull_request;

  let showIsReview = true;

  if (action === 'submitted' && review.state === 'commented') {
    throw new StopHandleError(
      'review comment is handled by handleReviewComment',
    );
  }

  if (review.state) {
    action = review.state as string;
    if (review.state === 'approved') {
      showIsReview = false;
    }
  }

  const title = titleTpl({
    repo: payload.repository,
    event: 'review',
    action,
  });

  const builder = new StringBuilder();

  builder.add(
    `#### ${renderRepoLink(payload.repository)} ${renderUserLink(
      payload.sender,
    )} ${action}${
      showIsReview ? `([review](${review.html_url}))` : ''
    } [pull request#${pr.number}](${pr.html_url})\n

${renderPrOrIssue(pr, false)}
`,
  );

  builder.add(useRef(review.body, ctx.setting.contentLimit));

  return {
    title,
    text: builder.build(),
  };
}
