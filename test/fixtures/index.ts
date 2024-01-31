import {
  PullRequestClosedEvent,
  PullRequestOpenedEvent,
  PullRequestEditedEvent,
  PullRequestReviewCommentCreatedEvent,
  PullRequestReviewCommentDeletedEvent,
  PullRequestReviewCommentEditedEvent,
  PullRequestReviewSubmittedEvent,
  PullRequestReviewDismissedEvent,
  DiscussionCommentCreatedEvent,
  DiscussionCreatedEvent,
  ReleasePublishedEvent,
  IssuesOpenedEvent,
} from '@octokit/webhooks-types';

import _antd_mini_release_published from './antd_mini_release_published.json';
import _discussion_0_created from './generated/discussion_90_0_created.json';
import _discussion_comment_0_created from './generated/discussion_comment_90_0_created.json';
import pull_request_0_opened from './generated/pull_request_2_0_opened.json';
import _pull_request_13_opened from './generated/pull_request_2_13_opened.json';
import pull_request_3_closed from './generated/pull_request_2_3_closed.json';
import _pull_request_review_comment_0_created from './generated/pull_request_2_review_comment_0_created.json';
import _pull_request_review_comment_1_created from './generated/pull_request_2_review_comment_1_created.json';
import _pull_request_review_comment_2_created from './generated/pull_request_2_review_comment_2_created.json';
import _pull_request_review_comment_3_deleted from './generated/pull_request_2_review_comment_3_deleted.json';
import _pull_request_review_comment_4_edited from './generated/pull_request_2_review_comment_4_edited.json';
import _pull_request_review_0_submitted from './generated/pull_request_review_2_0_submitted_commented.json';
import _pull_request_review_1_dismissed from './generated/pull_request_review_2_1_dismissed_dismissed.json';
import _pull_request_review_2_submitted from './generated/pull_request_review_2_2_submitted_commented.json';
import _pull_request_review_3_submitted from './generated/pull_request_review_2_3_submitted_commented.json';
import _issue2045 from './issue-2045.json';
import _issue_opened from './issue_opened.json';
import _pr2060 from './pr-2060.json';
import _pull_request_edited_base from './pull_request_edited_base.json';
import _pull_request_edited_wip from './pull_request_edited_wip.json';
import _pull_request_review_4_submitted_changes_requested from './pull_request_review_4_submitted_changes_requested.json';
import _release_published from './release_published.json';

export const pull_request_review_0_submitted =
  _pull_request_review_0_submitted as unknown as PullRequestReviewSubmittedEvent;
export const pull_request_review_1_dismissed =
  _pull_request_review_1_dismissed as unknown as PullRequestReviewDismissedEvent;
export const pull_request_review_2_submitted =
  _pull_request_review_2_submitted as unknown as PullRequestReviewSubmittedEvent;
export const pull_request_review_3_submitted =
  _pull_request_review_3_submitted as unknown as PullRequestReviewSubmittedEvent;
export const pull_request_review_4_submitted_changes_requested =
  _pull_request_review_4_submitted_changes_requested as unknown as PullRequestReviewSubmittedEvent;

export const pull_request_review_comment_0_created =
  _pull_request_review_comment_0_created as unknown as PullRequestReviewCommentCreatedEvent;
export const pull_request_review_comment_1_created =
  _pull_request_review_comment_1_created as unknown as PullRequestReviewCommentCreatedEvent;
export const pull_request_review_comment_2_created =
  _pull_request_review_comment_2_created as unknown as PullRequestReviewCommentCreatedEvent;
export const pull_request_review_comment_3_deleted =
  _pull_request_review_comment_3_deleted as unknown as PullRequestReviewCommentDeletedEvent;
export const pull_request_review_comment_4_edited =
  _pull_request_review_comment_4_edited as unknown as PullRequestReviewCommentEditedEvent;

export const discussion_0_created =
  _discussion_0_created as unknown as DiscussionCreatedEvent;
export const discussion_comment_0_created =
  _discussion_comment_0_created as unknown as DiscussionCommentCreatedEvent;

export const pull_request_closed =
  pull_request_3_closed as unknown as PullRequestClosedEvent;
export const pull_request_opened =
  pull_request_0_opened as unknown as PullRequestOpenedEvent;
export const pull_request_13_opened =
  _pull_request_13_opened as PullRequestOpenedEvent;
export const pull_request_edited_wip =
  _pull_request_edited_wip as unknown as PullRequestEditedEvent;
export const pull_request_edited_base =
  _pull_request_edited_base as unknown as PullRequestEditedEvent;
export const release_published =
  _release_published as unknown as ReleasePublishedEvent;
export const issue2045 = _issue2045 as any;
export const pr2060 = _pr2060 as any;

export const antd_mini_release_published =
  _antd_mini_release_published as ReleasePublishedEvent;

export const issue_opened_event = _issue_opened as IssuesOpenedEvent;
