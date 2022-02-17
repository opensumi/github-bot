import { StringBuilder } from '@/utils';
import {
  renderPrOrIssueLink,
  renderRepoLink,
  renderUserLink,
  StopHandleError,
  useRef,
} from '.';
import { ExtractPayload, MarkdownContent } from '../types';
import { titleTpl } from './trivias';

export async function handleReview(
  payload: ExtractPayload<'pull_request_review'>,
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
    )} ${action} ${
      showIsReview ? `[review](${review.html_url}) on ` : ''
    }${renderPrOrIssueLink(pr, 'PR')}\n`,
  );

  builder.add(useRef(review.body));

  return {
    title,
    text: builder.build(),
  };
}
