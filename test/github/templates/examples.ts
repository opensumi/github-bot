import {
  PullRequestClosedEvent,
  PullRequestOpenedEvent,
} from '@octokit/webhooks-types';
import pull_request_0_opened from '../../fixtures/generated/pull_request_0_opened.json';
import pull_request_3_closed from '../../fixtures/generated/pull_request_3_closed.json';
import _pull_request_edited_wip from '../../fixtures/pull_request_edited_wip.json';

const pull_request_closed =
  pull_request_3_closed as unknown as PullRequestClosedEvent;
const pull_request_opened =
  pull_request_0_opened as unknown as PullRequestOpenedEvent;
const pull_request_edited_wip =
  _pull_request_edited_wip as unknown as PullRequestOpenedEvent;

export { pull_request_closed, pull_request_opened, pull_request_edited_wip };
