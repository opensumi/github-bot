import 'dotenv/config';

import { EmitterWebhookEventName } from '@octokit/webhooks';

import { IGitHubEventQueueMessage } from '@/queue/types';
import { GitHubEventWorker } from '@/queue/worker/github';

import { prepareEnv } from '../__mocks__';
import { MockMessageBatch } from '../__mocks__/queue/message';
import {
  pull_request_closed,
  pull_request_opened,
  pull_request_13_opened,
  pull_request_edited_wip,
  pull_request_edited_base,
  issue_opened_event,
  release_published,
  antd_mini_release_published,
  pull_request_review_comment_0_created,
  pull_request_review_4_submitted_changes_requested,
  pull_request_review_comment_1_created,
} from '../fixtures';

const botId = 'mock';

const describe = process.env.GITHUB_TOKEN
  ? global.describe
  : global.describe.skip;

describe('queue', () => {
  beforeAll(() => {
    prepareEnv();
  });

  it('should work', async () => {
    const wk = new GitHubEventWorker('app');
    const events = [
      { name: 'pull_request.closed', payload: pull_request_closed },
      { name: 'pull_request.opened', payload: pull_request_opened },
      { name: 'pull_request.opened', payload: pull_request_13_opened },
      { name: 'pull_request.edited', payload: pull_request_edited_wip },
      { name: 'pull_request.edited', payload: pull_request_edited_base },
      { name: 'issues.opened', payload: issue_opened_event },
      { name: 'release.published', payload: release_published },
      { name: 'release.published', payload: antd_mini_release_published },
      {
        name: 'pull_request_review_comment.created',
        payload: pull_request_review_comment_0_created,
      },
    ] as { name: EmitterWebhookEventName; payload: any }[];

    const githubAppMessage = events.map((v) => ({
      botId,
      type: 'github-app',
      data: {
        id: `${Math.random()}`,
        name: v.name,
        payload: v.payload,
      },
    })) as IGitHubEventQueueMessage[];

    const batch = MockMessageBatch.from(githubAppMessage);
    batch.messages.forEach((v) => {
      wk.push(v);
    });

    await wk.run();
  });

  it('can composite pr review', async () => {
    const wk = new GitHubEventWorker('app');
    const events = [
      {
        name: 'pull_request_review.submitted',
        payload: pull_request_review_4_submitted_changes_requested,
      },
      {
        name: 'pull_request_review_comment.created',
        payload: pull_request_review_comment_0_created,
      },
      {
        name: 'pull_request_review_comment.created',
        payload: pull_request_review_comment_1_created,
      },
    ] as { name: EmitterWebhookEventName; payload: any }[];

    const reviews = events.map((v) => ({
      botId,
      type: 'github-app',
      data: {
        id: `${Math.random()}`,
        name: v.name,
        payload: v.payload,
      },
    })) as IGitHubEventQueueMessage[];

    const batch = MockMessageBatch.from(reviews);
    wk.push(...batch.messages);

    await wk.run();
  });
});
