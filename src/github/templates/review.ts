import { StringBuilder } from '@/utils';
import { renderPrOrIssueLink, renderRepoLink, renderUserLink, useRef } from '.';
import { ExtractPayload, MarkdownContent } from '../types';
import { titleTpl } from './trivias';

export async function handleReview(
  payload: ExtractPayload<'pull_request_review'>,
): Promise<MarkdownContent> {
  const review = payload.review;
  const action = payload.action;
  const pr = payload.pull_request;

  const title = titleTpl({
    repo: payload.repository,
    event: 'review',
    action,
  });

  const builder = new StringBuilder();

  builder.add(
    `${renderRepoLink(payload.repository)} ${renderUserLink(
      payload.sender,
    )} ${action} [review](${review.html_url}) on ${renderPrOrIssueLink(pr)}\n`,
  );
  builder.add(`State: ${review.state}\n`);
  builder.add(useRef(review.body));

  return {
    title,
    text: builder.build(),
  };
}
