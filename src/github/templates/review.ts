import { Context, ExtractPayload, TemplateRenderResult } from '../types';

import { StopHandleError, textTpl } from './utils';

export async function handleReview(
  payload: ExtractPayload<'pull_request_review'>,
  ctx: Context,
): Promise<TemplateRenderResult> {
  const review = payload.review;
  const action = payload.action;

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

  let doNotRenderBody = false;

  if (review.state === 'changes_requested') {
    titleActionText = 'requested changes';
    did = 'requested';
    something = 'changes';
  }

  if (action === 'dismissed') {
    did = 'dismissed';
    something = 'review';
    doNotRenderBody = true;
  }

  let textFirstLine = `{{sender|link}} [${did}]({{review.html_url}}) `;
  if (something) {
    textFirstLine += `${something} on `;
  }
  textFirstLine += `[pull request]({{pull_request.html_url}})`;

  const text = textTpl(
    {
      payload,
      event: 'review',
      target: '#### {{pull_request|link}}',
      action: titleActionText,
      title: textFirstLine,
      body: '{{review.body}}',
      doNotRenderBody: doNotRenderBody,
    },
    ctx,
  );

  return text;
}
