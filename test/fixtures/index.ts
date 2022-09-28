import {
  PullRequestClosedEvent,
  PullRequestOpenedEvent,
  PullRequestEditedEvent,
} from '@octokit/webhooks-types';
import pull_request_0_opened from './generated/pull_request_0_opened.json';
import pull_request_3_closed from './generated/pull_request_3_closed.json';
import _pull_request_edited_wip from './pull_request_edited_wip.json';
import _pull_request_edited_base from './pull_request_edited_base.json';

export const pull_request_closed =
  pull_request_3_closed as unknown as PullRequestClosedEvent;
export const pull_request_opened =
  pull_request_0_opened as unknown as PullRequestOpenedEvent;
export const pull_request_edited_wip =
  _pull_request_edited_wip as unknown as PullRequestEditedEvent;
export const pull_request_edited_base =
  _pull_request_edited_base as unknown as PullRequestEditedEvent;
