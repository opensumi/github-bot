import { StringBuilder } from '@/utils';
import {
  renderUserLink,
  StopHandleError,
  useRef,
  titleTpl,
  renderPrOrIssue,
  textTpl,
} from '.';
import { Context } from '../app';
import { ExtractPayload, MarkdownContent } from '../types';

export async function handleReview(
  payload: ExtractPayload<'pull_request_review'>,
  ctx: Context,
): Promise<MarkdownContent> {
  const review = payload.review;
  const action = payload.action;
  const pr = payload.pull_request;

  if (action === 'submitted' && review.state === 'commented') {
    throw new StopHandleError(
      'review comment is handled by handleReviewComment',
    );
  }

  let titleActionText = action as string;
  let fullAction = action as string;

  if (review.state) {
    titleActionText = review.state;
    fullAction = review.state;
  }

  if (review.state === 'changes_requested') {
    titleActionText = 'requested changes';
    fullAction = 'changes requested';
  }

  if (action === 'dismissed') {
    fullAction = 'dismissed their stale review';
  }

  const title = titleTpl(
    {
      repo: payload.repository,
      event: 'review',
      action: titleActionText,
    },
    ctx,
  );

  const builder = new StringBuilder();
  builder.add(renderPrOrIssue(pr, false));
  builder.add(useRef(review.body, ctx.setting.contentLimit));

  const text = textTpl(
    {
      title: `${renderUserLink(payload.sender)} [${fullAction}](${
        review.html_url
      }) on [pull request](${pr.html_url})`,
      body: builder.build(),
      repo: payload.repository,
    },
    ctx,
  );

  return {
    title,
    text,
  };
}
