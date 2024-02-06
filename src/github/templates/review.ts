import { StringBuilder } from '@/utils/string-builder';

import { Context, ExtractPayload, TemplateRenderResult } from '../types';

import {
  StopHandleError,
  useRef,
  titleTpl,
  renderPrOrIssueTitleLink,
  textTpl,
} from '.';

export async function handleReview(
  payload: ExtractPayload<'pull_request_review'>,
  ctx: Context,
): Promise<TemplateRenderResult> {
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
    something = 'review';
  }

  const title = titleTpl(
    {
      payload,
      event: 'review',
      action: titleActionText,
    },
    ctx,
  );

  const builder = new StringBuilder();

  builder.add(renderPrOrIssueTitleLink(pr));
  builder.add(useRef(review.body, ctx.setting.contentLimit));

  let textFirstLine = `{{sender|link}} [${did}]({{review.html_url}}) `;
  if (something) {
    textFirstLine += `${something} on `;
  }
  textFirstLine += `[pull request]({{pull_request.html_url}})`;

  const text = textTpl(
    {
      payload,
      title: textFirstLine,
      body: builder.build(),
    },
    ctx,
  );

  return {
    title,
    ...text,
  };
}
