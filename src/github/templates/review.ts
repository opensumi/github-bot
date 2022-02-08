import { StringBuilder } from '@/utils';
import {
  renderPrOrIssueLink,
  renderPrOrIssueText,
  renderRepoLink,
  renderUserLink,
  useRef,
} from '.';
import { ExtractPayload, MarkdownContent } from '../types';

export async function handleReview(
  payload: ExtractPayload<'pull_request_review'>,
): Promise<MarkdownContent> {
  const action = payload.action;
  const review = payload.review;
  const pr = payload.pull_request;

  const title = `[${
    payload.repository.name
  }] review ${action} on pr ${renderPrOrIssueText(pr)} by ${
    payload.sender.login
  }`;

  const builder = new StringBuilder();

  builder.add(
    `${renderRepoLink(payload.repository)} ${renderUserLink(
      payload.sender,
    )} ${action} [review](${review.html_url}) on pr ${renderPrOrIssueLink(
      pr,
    )}\n`,
  );
  builder.add(`State: ${review.state}\n`);
  builder.add(useRef(review.body));

  return {
    title,
    text: builder.build(),
  };
}
