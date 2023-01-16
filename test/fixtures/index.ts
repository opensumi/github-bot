import {
  PullRequestClosedEvent,
  PullRequestOpenedEvent,
  PullRequestEditedEvent,
  PullRequestReviewCommentCreatedEvent,
  ReleasePublishedEvent,
} from '@octokit/webhooks-types';

import pull_request_0_opened from './generated/pull_request_0_opened.json';
import pull_request_3_closed from './generated/pull_request_3_closed.json';
import _pull_request_review_comment_0_created from './generated/pull_request_review_comment_0_created.json';
import _issue2045 from './issue-2045.json';
import _pr2060 from './pr-2060.json';
import _pull_request_edited_base from './pull_request_edited_base.json';
import _pull_request_edited_wip from './pull_request_edited_wip.json';
import _release_published from './release_published.json';

export const pull_request_review_comment_0_created =
  _pull_request_review_comment_0_created as unknown as PullRequestReviewCommentCreatedEvent;

export const pull_request_closed =
  pull_request_3_closed as unknown as PullRequestClosedEvent;
export const pull_request_opened =
  pull_request_0_opened as unknown as PullRequestOpenedEvent;
export const pull_request_edited_wip =
  _pull_request_edited_wip as unknown as PullRequestEditedEvent;
export const pull_request_edited_base =
  _pull_request_edited_base as unknown as PullRequestEditedEvent;
export const release_published =
  _release_published as unknown as ReleasePublishedEvent;
export const issue2045 = _issue2045 as any;
export const pr2060 = _pr2060 as any;
