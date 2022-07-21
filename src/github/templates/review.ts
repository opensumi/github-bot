import { StringBuilder } from '@/utils';
import {
  renderUserLink,
  StopHandleError,
  useRef,
  titleTpl,
  renderPrOrIssue,
  textTpl,
  detailTitleTpl,
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
  let did = action as string;
  let something = undefined;

  if (review.state) {
    titleActionText = review.state;
    did = review.state;
  }

  if (review.state === 'changes_requested') {
    titleActionText = 'requested changes';
    did = 'requested';
    something = 'changes';
  }

  if (action === 'dismissed') {
    did = 'dismissed';
    something = 'their stale review';
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
      title: detailTitleTpl(
        {
          somebody: payload.sender,
          did: {
            text: did,
            html_url: review.html_url,
          },
          something,
          something1: {
            text: 'pull request',
            html_url: pr.html_url,
          },
        },
        ctx,
      ),
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
