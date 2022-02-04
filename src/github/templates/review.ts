import {
  renderPrOrIssueLink,
  renderPrOrIssueText,
  renderRepoLink,
  renderUserLink,
  useRef,
} from '.';
import { ExtractPayload } from '../types';

export function handleReview(payload: ExtractPayload<'pull_request_review'>) {
  const action = payload.action;
  const review = payload.review;
  const pr = payload.pull_request;

  const title = `[${
    payload.repository.name
  }] review ${action} on PR${renderPrOrIssueText(pr)} by ${
    payload.sender.login
  }`;

  let text = `${renderRepoLink(payload.repository)} [review](${
    review.html_url
  }) ${action} on PR${renderPrOrIssueLink(pr)} by ${renderUserLink(
    payload.sender,
  )}\n`;

  text += `State: ${review.state}

> ${useRef(review.body)}
`;

  return {
    title,
    text,
  };
}
