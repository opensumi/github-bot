import { Context, ExtractPayload } from '../types';

import { StopHandleError, Template, TemplateRenderResult } from './components';

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

  let textFirstLine = `{{sender|link}} `;
  if (something) {
    textFirstLine += `[${did} ${something}]({{review.html_url}}) on `;
  } else {
    textFirstLine += `[${did}]({{review.html_url}}) `;
  }

  textFirstLine += `[pull request]({{pull_request.html_url}})`;

  return Template(
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
}
