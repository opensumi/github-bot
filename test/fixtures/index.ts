import {
  PullRequestEditedEvent,
  PullRequestReviewSubmittedEvent,
  ReleasePublishedEvent,
  IssuesOpenedEvent,
  PullRequestOpenedEvent,
} from '@octokit/webhooks-types';

import _antd_mini_release_published from './antd_mini_release_published.json';
import _issue2045 from './issue-2045.json';
import _issue_opened from './issue_opened.json';
import _pr2060 from './pr-2060.json';
import _pr3628_open from './pr-3628-open.json';
import _pull_request_edited_base from './pull_request_edited_base.json';
import _pull_request_edited_wip from './pull_request_edited_wip.json';
import _pull_request_review_4_submitted_changes_requested from './pull_request_review_4_submitted_changes_requested.json';
import _pull_request_review_submitted_approved from './pull_request_review_submitted_approved.json';
import _release_published from './release_published.json';

export const pull_request_review_4_submitted_changes_requested =
  _pull_request_review_4_submitted_changes_requested as unknown as PullRequestReviewSubmittedEvent;

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

export const pull_request_review_submitted_approved =
  _pull_request_review_submitted_approved as PullRequestReviewSubmittedEvent;

export const pr3628_open = _pr3628_open as PullRequestOpenedEvent;

export * from './generated';
